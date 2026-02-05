// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/contracts/ReputationToken.sol";
import "../src/contracts/CodeRegistry.sol";
import "../src/interfaces/IReputationToken.sol";
import "../src/interfaces/ICodeRegistry.sol";

/**
 * @title ReputationTokenTest
 * @notice Comprehensive test suite for ReputationToken contract (LSP7)
 * @dev Tests cover minting, voting, levels, and LSP7 compliance
 */
contract ReputationTokenTest is Test {
    
    ReputationToken public token;
    CodeRegistry public registry;
    
    address public owner;
    address public minter;
    address public user1;
    address public user2;
    address public author;
    
    uint256 public constant POSTING_FEE = 0.01 ether;
    uint256 public constant VOTE_REWARD = 10;
    
    function setUp() public {
        owner = address(this);
        minter = makeAddr("minter");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        author = makeAddr("author");
        
        vm.deal(author, 10 ether);
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
        
        // Deploy registry first
        registry = new CodeRegistry(POSTING_FEE);
        
        // Deploy token
        token = new ReputationToken(
            "Agent Reputation",
            "AGENT_REP",
            18,
            address(registry),
            VOTE_REWARD
        );
        
        // Add minter
        token.addMinter(minter);
    }
    
    // ============ LSP7 Core Tests ============
    
    /**
     * @notice Test token metadata
     * @dev Verifies: name, symbol, decimals
     */
    function test_tokenMetadata() public view {
        assertEq(token.name(), "Agent Reputation");
        assertEq(token.symbol(), "AGENT_REP");
        assertEq(token.decimals(), 18);
    }
    
    /**
     * @notice Test minting by minter
     * @dev Verifies: balance update, total supply
     */
    function test_mintReputation() public {
        uint256 amount = 1000;
        string memory reason = "Test reward";
        
        vm.prank(minter);
        token.mintReputation(user1, amount, reason);
        
        assertEq(token.balanceOf(user1), amount);
        assertEq(token.totalSupply(), amount);
    }
    
    /**
     * @notice Test minting by owner
     * @dev Verifies: owner can also mint
     */
    function test_mintByOwner() public {
        uint256 amount = 500;
        
        token.mintReputation(user1, amount, "Owner mint");
        
        assertEq(token.balanceOf(user1), amount);
    }
    
    /**
     * @notice Test unauthorized minting rejection
     * @dev Verifies: only minters can mint
     */
    function test_mintReputation_unauthorized() public {
        vm.prank(user1);
        vm.expectRevert(IReputationToken.UnauthorizedMinter.selector);
        token.mintReputation(user2, 100, "Unauthorized");
    }
    
    /**
     * @notice Test operator authorization
     * @dev Verifies: LSP7 operator pattern
     */
    function test_authorizeOperator() public {
        uint256 amount = 100;
        
        vm.prank(user1);
        token.authorizeOperator(user2, amount);
        
        assertEq(token.authorizedAmountFor(user2, user1), amount);
        
        address[] memory ops = token.getOperatorsOf(user1);
        assertEq(ops.length, 1);
        assertEq(ops[0], user2);
    }
    
    /**
     * @notice Test operator revocation
     * @dev Verifies: operator removal
     */
    function test_revokeOperator() public {
        vm.prank(user1);
        token.authorizeOperator(user2, 100);
        
        vm.prank(user1);
        token.revokeOperator(user2);
        
        assertEq(token.authorizedAmountFor(user2, user1), 0);
        
        address[] memory ops = token.getOperatorsOf(user1);
        assertEq(ops.length, 0);
    }
    
    // ============ Voting Tests ============
    
    /**
     * @notice Test upvoting code
     * @dev Verifies: vote recorded, reward earned
     */
    function test_upvoteCode() public {
        // Post a code first
        vm.prank(author);
        uint256 codeId = registry.postCode{value: POSTING_FEE}(
            "QmTest", "Test", "Desc",
            ICodeRegistry.Language.Solidity,
            ICodeRegistry.Category.Utility,
            new uint256[](0)
        );
        
        // Upvote
        vm.prank(user1);
        bool success = token.upvoteCode(codeId);
        
        assertTrue(success);
        assertTrue(token.hasVoted(codeId, user1));
        assertEq(token.getPendingRewards(user1), VOTE_REWARD);
        
        (uint256 upvotes, uint256 downvotes) = token.getCodeVoteCount(codeId);
        assertEq(upvotes, 1);
        assertEq(downvotes, 0);
    }
    
    /**
     * @notice Test downvoting code
     * @dev Verifies: downvote recorded
     */
    function test_downvoteCode() public {
        // Post a code
        vm.prank(author);
        uint256 codeId = registry.postCode{value: POSTING_FEE}(
            "QmTest", "Test", "Desc",
            ICodeRegistry.Language.Solidity,
            ICodeRegistry.Category.Utility,
            new uint256[](0)
        );
        
        // Downvote
        vm.prank(user1);
        bool success = token.downvoteCode(codeId);
        
        assertTrue(success);
        
        (uint256 upvotes, uint256 downvotes) = token.getCodeVoteCount(codeId);
        assertEq(upvotes, 0);
        assertEq(downvotes, 1);
    }
    
    /**
     * @notice Test preventing double upvote
     * @dev Verifies: cannot vote twice
     */
    function test_upvoteCode_alreadyVoted() public {
        // Post code
        vm.prank(author);
        uint256 codeId = registry.postCode{value: POSTING_FEE}(
            "QmTest", "Test", "Desc",
            ICodeRegistry.Language.Solidity,
            ICodeRegistry.Category.Utility,
            new uint256[](0)
        );
        
        // First vote
        vm.prank(user1);
        token.upvoteCode(codeId);
        
        // Second vote should fail
        vm.prank(user1);
        vm.expectRevert(IReputationToken.AlreadyVoted.selector);
        token.upvoteCode(codeId);
    }
    
    /**
     * @notice Test preventing self-voting
     * @dev Verifies: author cannot vote own code
     */
    function test_upvoteCode_selfVotingNotAllowed() public {
        // Author posts code
        vm.prank(author);
        uint256 codeId = registry.postCode{value: POSTING_FEE}(
            "QmTest", "Test", "Desc",
            ICodeRegistry.Language.Solidity,
            ICodeRegistry.Category.Utility,
            new uint256[](0)
        );
        
        // Author tries to upvote own code
        vm.prank(author);
        vm.expectRevert(IReputationToken.SelfVotingNotAllowed.selector);
        token.upvoteCode(codeId);
    }
    
    /**
     * @notice Test vote counting
     * @dev Verifies: accurate vote tallies
     */
    function test_getCodeVoteCount() public {
        // Post code
        vm.prank(author);
        uint256 codeId = registry.postCode{value: POSTING_FEE}(
            "QmTest", "Test", "Desc",
            ICodeRegistry.Language.Solidity,
            ICodeRegistry.Category.Utility,
            new uint256[](0)
        );
        
        // Multiple votes
        vm.prank(user1);
        token.upvoteCode(codeId);
        
        vm.prank(user2);
        token.upvoteCode(codeId);
        
        address user3 = makeAddr("user3");
        vm.prank(user3);
        token.downvoteCode(codeId);
        
        (uint256 upvotes, uint256 downvotes) = token.getCodeVoteCount(codeId);
        assertEq(upvotes, 2);
        assertEq(downvotes, 1);
    }
    
    /**
     * @notice Test total votes by user
     * @dev Verifies: user vote tracking
     */
    function test_getTotalVotesByUser() public {
        // Post multiple codes
        vm.startPrank(author);
        uint256 code1 = registry.postCode{value: POSTING_FEE}(
            "QmTest1", "Test1", "Desc",
            ICodeRegistry.Language.Solidity,
            ICodeRegistry.Category.Utility,
            new uint256[](0)
        );
        uint256 code2 = registry.postCode{value: POSTING_FEE}(
            "QmTest2", "Test2", "Desc",
            ICodeRegistry.Language.Python,
            ICodeRegistry.Category.DeFi,
            new uint256[](0)
        );
        vm.stopPrank();
        
        // User votes on both
        vm.startPrank(user1);
        token.upvoteCode(code1);
        token.upvoteCode(code2);
        vm.stopPrank();
        
        assertEq(token.getTotalVotesByUser(user1), 2);
    }
    
    // ============ Level Tests ============
    
    /**
     * @notice Test initial level
     * @dev Verifies: new users start at level 0
     */
    function test_getUserLevel_initial() public view {
        assertEq(token.getUserLevel(user1), 0);
    }
    
    /**
     * @notice Test level progression
     * @dev Verifies: levels increase with reputation
     */
    function test_getUserLevel_progression() public {
        // Level thresholds from constructor:
        // 0: Novice, 100: Apprentice, 500: Journeyman, 1000: Expert, etc.
        
        // Mint enough for Apprentice (level 1)
        vm.prank(minter);
        token.mintReputation(user1, 100, "Level up to 1");
        
        assertEq(token.getUserLevel(user1), 1);
        assertEq(token.getLevelName(1), "Apprentice");
        
        // Mint enough for Journeyman (level 2)
        vm.prank(minter);
        token.mintReputation(user1, 400, "Level up to 2");
        
        assertEq(token.getUserLevel(user1), 2);
        assertEq(token.getLevelName(2), "Journeyman");
        
        // Mint enough for Expert (level 3)
        vm.prank(minter);
        token.mintReputation(user1, 500, "Level up to 3");
        
        assertEq(token.getUserLevel(user1), 3);
        assertEq(token.getLevelName(3), "Expert");
    }
    
    /**
     * @notice Test level thresholds
     * @dev Verifies: correct threshold retrieval
     */
    function test_getLevelThreshold() public view {
        assertEq(token.getLevelThreshold(0), 0);      // Novice
        assertEq(token.getLevelThreshold(1), 100);    // Apprentice
        assertEq(token.getLevelThreshold(2), 500);    // Journeyman
        assertEq(token.getLevelThreshold(3), 1000);   // Expert
    }
    
    /**
     * @notice Test level names
     * @dev Verifies: correct name retrieval
     */
    function test_getLevelName() public view {
        assertEq(token.getLevelName(0), "Novice");
        assertEq(token.getLevelName(1), "Apprentice");
        assertEq(token.getLevelName(2), "Journeyman");
    }
    
    // ============ Quality Reward Tests ============
    
    /**
     * @notice Test quality reward distribution
     * @dev Verifies: batch reward distribution
     */
    function test_rewardQuality() public {
        // Post code
        vm.prank(author);
        uint256 codeId = registry.postCode{value: POSTING_FEE}(
            "QmTest", "Test", "Desc",
            ICodeRegistry.Language.Solidity,
            ICodeRegistry.Category.Utility,
            new uint256[](0)
        );
        
        // Set reward pool
        token.setQualityRewardPool(1000);
        
        // Distribute rewards
        address[] memory contributors = new address[](2);
        contributors[0] = user1;
        contributors[1] = user2;
        
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 300;
        amounts[1] = 200;
        
        vm.prank(minter);
        token.rewardQuality(codeId, contributors, amounts);
        
        assertEq(token.balanceOf(user1), 300);
        assertEq(token.balanceOf(user2), 200);
    }
    
    /**
     * @notice Test quality reward with mismatched arrays
     * @dev Verifies: array length validation
     */
    function test_rewardQuality_arrayMismatch() public {
        address[] memory contributors = new address[](2);
        contributors[0] = user1;
        contributors[1] = user2;
        
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 100;
        
        vm.prank(minter);
        vm.expectRevert(IReputationToken.ArrayLengthMismatch.selector);
        token.rewardQuality(1, contributors, amounts);
    }
    
    // ============ Admin Tests ============
    
    function test_addMinter() public {
        address newMinter = makeAddr("newMinter");
        
        token.addMinter(newMinter);
        
        assertTrue(token.isMinter(newMinter));
    }
    
    function test_removeMinter() public {
        token.removeMinter(minter);
        
        assertFalse(token.isMinter(minter));
    }
    
    function test_setVoteReward() public {
        uint256 newReward = 20;
        
        token.setVoteReward(newReward);
        
        // Verify by checking pending rewards after vote
        vm.prank(author);
        uint256 codeId = registry.postCode{value: POSTING_FEE}(
            "QmTest", "Test", "Desc",
            ICodeRegistry.Language.Solidity,
            ICodeRegistry.Category.Utility,
            new uint256[](0)
        );
        
        vm.prank(user1);
        token.upvoteCode(codeId);
        
        assertEq(token.getPendingRewards(user1), newReward);
    }
    
    function test_setQualityRewardPool() public {
        token.setQualityRewardPool(5000);
        // No direct getter, but used in rewardQuality
    }
    
    function test_nonOwnerCannotAddMinter() public {
        vm.prank(user1);
        vm.expectRevert();
        token.addMinter(user2);
    }
    
    // ============ Edge Cases ============
    
    /**
     * @notice Test voting on non-existent code
     * @dev Verifies: code existence check
     */
    function test_upvoteCode_invalidCodeId() public {
        vm.prank(user1);
        // Code 0 is invalid but Solidity doesn't revert on mapping access
        // The registry check will fail
        vm.expectRevert(IReputationToken.InvalidCodeId.selector);
        token.upvoteCode(0);
    }
    
    /**
     * @notice Test transfer restrictions
     * @dev Verifies: reputation tokens are non-transferable by default
     */
    function test_transfer_restricted() public {
        // Mint tokens
        vm.prank(minter);
        token.mintReputation(user1, 1000, "Test");
        
        // Try to transfer (should fail without authorization)
        vm.prank(user1);
        vm.expectRevert(IReputationToken.TransferNotAllowed.selector);
        token.transfer(user1, user2, 100, true, "");
    }
    
    /**
     * @notice Test burning tokens
     * @dev Verifies: burn functionality
     */
    function test_burn() public {
        // Mint tokens
        vm.prank(minter);
        token.mintReputation(user1, 1000, "Test");
        
        // Burn tokens
        vm.prank(minter);
        token.burn(user1, 500, "");
        
        assertEq(token.balanceOf(user1), 500);
        assertEq(token.totalSupply(), 500);
    }
    
    // ============ Gas Optimization Notes ============
    // - Level calculation happens on mint (not on every balance check)
    // - Vote storage uses single struct per vote
    // - Operator list management is gas-optimized
}
