// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/contracts/CodeRegistry.sol";
import "../src/contracts/CodeAttribution.sol";
import "../src/interfaces/ICodeRegistry.sol";
import "../src/interfaces/ICodeAttribution.sol";

/**
 * @title CodeAttributionTest
 * @notice Comprehensive test suite for CodeAttribution contract
 * @dev Tests cover attribution creation, lineage tracking, and fork relationships
 */
contract CodeAttributionTest is Test {
    
    CodeRegistry public registry;
    CodeAttribution public attribution;
    
    address public owner;
    address public author;
    address public forker;
    
    uint256 public constant POSTING_FEE = 0.01 ether;
    
    // Test data
    string constant IPFS_HASH_1 = "QmTest1";
    string constant IPFS_HASH_2 = "QmTest2";
    string constant IPFS_HASH_3 = "QmTest3";
    string constant IPFS_HASH_4 = "QmTest4";
    
    function setUp() public {
        owner = address(this);
        author = makeAddr("author");
        forker = makeAddr("forker");
        
        vm.deal(author, 10 ether);
        vm.deal(forker, 10 ether);
        
        // Deploy contracts
        registry = new CodeRegistry(POSTING_FEE, address(0));
        attribution = new CodeAttribution(address(registry));
    }
    
    // ============ Happy Path Tests ============
    
    /**
     * @notice Test creating attribution for original code
     * @dev Verifies: attribution stored, root set to self
     */
    function test_createAttribution_original() public {
        uint256 codeId = 1;
        
        vm.prank(address(registry));
        attribution.createAttribution(codeId, 0, author);
        
        ICodeAttribution.Attribution memory attr = attribution.getAttribution(codeId);
        
        assertEq(attr.codeId, codeId);
        assertEq(attr.parentId, 0);
        assertEq(attr.author, author);
        assertEq(attr.depth, 0);
        
        // Root should be itself
        assertEq(attribution.getRootCode(codeId), codeId);
        
        // Should not be derivative
        assertFalse(attribution.isDerivative(codeId));
    }
    
    /**
     * @notice Test creating attribution for forked code
     * @dev Verifies: parent linkage, depth calculation
     */
    function test_createAttribution_fork() public {
        // Create original
        uint256 originalId = 1;
        vm.prank(address(registry));
        attribution.createAttribution(originalId, 0, author);
        
        // Create fork
        uint256 forkId = 2;
        vm.prank(address(registry));
        attribution.createAttribution(forkId, originalId, forker);
        
        ICodeAttribution.Attribution memory attr = attribution.getAttribution(forkId);
        
        assertEq(attr.codeId, forkId);
        assertEq(attr.parentId, originalId);
        assertEq(attr.author, forker);
        assertEq(attr.depth, 1);
        
        // Root should be the original
        assertEq(attribution.getRootCode(forkId), originalId);
        
        // Should be derivative
        assertTrue(attribution.isDerivative(forkId));
    }
    
    /**
     * @notice Test retrieving attribution chain
     * @dev Verifies: correct ancestor traversal
     */
    function test_getAttributionChain() public {
        // Create chain: A <- B <- C <- D
        uint256 codeA = 1;
        uint256 codeB = 2;
        uint256 codeC = 3;
        uint256 codeD = 4;
        
        vm.startPrank(address(registry));
        attribution.createAttribution(codeA, 0, author);
        attribution.createAttribution(codeB, codeA, forker);
        attribution.createAttribution(codeC, codeB, forker);
        attribution.createAttribution(codeD, codeC, forker);
        vm.stopPrank();
        
        // Get chain for D
        uint256[] memory chain = attribution.getAttributionChain(codeD);
        
        assertEq(chain.length, 3);
        assertEq(chain[0], codeC); // Immediate parent
        assertEq(chain[1], codeB);
        assertEq(chain[2], codeA); // Root
        
        // Get chain for B
        uint256[] memory chainB = attribution.getAttributionChain(codeB);
        assertEq(chainB.length, 1);
        assertEq(chainB[0], codeA);
        
        // Get chain for A (original)
        uint256[] memory chainA = attribution.getAttributionChain(codeA);
        assertEq(chainA.length, 0);
    }
    
    /**
     * @notice Test retrieving children (forks)
     * @dev Verifies: correct child tracking
     */
    function test_getChildren() public {
        uint256 parentId = 1;
        
        vm.prank(address(registry));
        attribution.createAttribution(parentId, 0, author);
        
        // Create multiple forks
        uint256 fork1 = 2;
        uint256 fork2 = 3;
        uint256 fork3 = 4;
        
        vm.startPrank(address(registry));
        attribution.createAttribution(fork1, parentId, forker);
        attribution.createAttribution(fork2, parentId, makeAddr("forker2"));
        attribution.createAttribution(fork3, parentId, makeAddr("forker3"));
        vm.stopPrank();
        
        uint256[] memory children = attribution.getChildren(parentId);
        
        assertEq(children.length, 3);
        assertEq(children[0], fork1);
        assertEq(children[1], fork2);
        assertEq(children[2], fork3);
    }
    
    /**
     * @notice Test retrieving all descendants
     * @dev Verifies: recursive descendant collection
     */
    function test_getAllDescendants() public {
        // Create tree:
        //       A
        //      / \
        //     B   C
        //    /       \
        //   D         E
        
        uint256 codeA = 1;
        uint256 codeB = 2;
        uint256 codeC = 3;
        uint256 codeD = 4;
        uint256 codeE = 5;
        
        vm.startPrank(address(registry));
        attribution.createAttribution(codeA, 0, author);
        attribution.createAttribution(codeB, codeA, forker);
        attribution.createAttribution(codeC, codeA, makeAddr("forker2"));
        attribution.createAttribution(codeD, codeB, forker);
        attribution.createAttribution(codeE, codeC, makeAddr("forker2"));
        vm.stopPrank();
        
        // Get descendants of A
        uint256[] memory descendantsA = attribution.getAllDescendants(codeA);
        assertEq(descendantsA.length, 4);
        
        // Get descendants of B
        uint256[] memory descendantsB = attribution.getAllDescendants(codeB);
        assertEq(descendantsB.length, 1);
        assertEq(descendantsB[0], codeD);
        
        // Get descendants of D (leaf node)
        uint256[] memory descendantsD = attribution.getAllDescendants(codeD);
        assertEq(descendantsD.length, 0);
    }
    
    /**
     * @notice Test isDerivative check
     * @dev Verifies: correct derivative detection
     */
    function test_isDerivative() public {
        uint256 originalId = 1;
        uint256 forkId = 2;
        
        vm.prank(address(registry));
        attribution.createAttribution(originalId, 0, author);
        
        vm.prank(address(registry));
        attribution.createAttribution(forkId, originalId, forker);
        
        assertFalse(attribution.isDerivative(originalId));
        assertTrue(attribution.isDerivative(forkId));
    }
    
    /**
     * @notice Test finding root code
     * @dev Verifies: correct root traversal through chain
     */
    function test_getRootCode() public {
        // Create long chain: A <- B <- C <- D <- E
        uint256 codeA = 1;
        uint256 codeB = 2;
        uint256 codeC = 3;
        uint256 codeD = 4;
        uint256 codeE = 5;
        
        vm.startPrank(address(registry));
        attribution.createAttribution(codeA, 0, author);
        attribution.createAttribution(codeB, codeA, forker);
        attribution.createAttribution(codeC, codeB, forker);
        attribution.createAttribution(codeD, codeC, forker);
        attribution.createAttribution(codeE, codeD, forker);
        vm.stopPrank();
        
        // All should have A as root
        assertEq(attribution.getRootCode(codeA), codeA);
        assertEq(attribution.getRootCode(codeB), codeA);
        assertEq(attribution.getRootCode(codeC), codeA);
        assertEq(attribution.getRootCode(codeD), codeA);
        assertEq(attribution.getRootCode(codeE), codeA);
    }
    
    /**
     * @notice Test fork count
     * @dev Verifies: accurate fork counting
     */
    function test_getForkCount() public {
        uint256 parentId = 1;
        
        vm.prank(address(registry));
        attribution.createAttribution(parentId, 0, author);
        
        assertEq(attribution.getForkCount(parentId), 0);
        
        // Add forks
        for (uint256 i = 2; i <= 5; i++) {
            vm.prank(address(registry));
            attribution.createAttribution(i, parentId, makeAddr(string(abi.encodePacked("forker", i))));
        }
        
        assertEq(attribution.getForkCount(parentId), 4);
    }
    
    /**
     * @notice Test hasAttribution check
     * @dev Verifies: existence check works
     */
    function test_hasAttribution() public {
        uint256 codeId = 1;
        
        assertFalse(attribution.hasAttribution(codeId));
        
        vm.prank(address(registry));
        attribution.createAttribution(codeId, 0, author);
        
        assertTrue(attribution.hasAttribution(codeId));
    }
    
    /**
     * @notice Test batch queries
     * @dev Verifies: efficient batch retrieval
     */
    function test_getAttributionsForCodes() public {
        // Create multiple attributions
        for (uint256 i = 1; i <= 3; i++) {
            vm.prank(address(registry));
            attribution.createAttribution(i, 0, makeAddr(string(abi.encodePacked("author", i))));
        }
        
        uint256[] memory codeIds = new uint256[](2);
        codeIds[0] = 1;
        codeIds[1] = 3;
        
        ICodeAttribution.Attribution[] memory attrs = attribution.getAttributionsForCodes(codeIds);
        
        assertEq(attrs.length, 2);
        assertEq(attrs[0].codeId, 1);
        assertEq(attrs[1].codeId, 3);
    }
    
    /**
     * @notice Test batch children query
     * @dev Verifies: efficient batch children retrieval
     */
    function test_getChildrenBatch() public {
        uint256 parent1 = 1;
        uint256 parent2 = 2;
        
        vm.startPrank(address(registry));
        attribution.createAttribution(parent1, 0, author);
        attribution.createAttribution(parent2, 0, author);
        
        // Add children to both
        attribution.createAttribution(3, parent1, forker);
        attribution.createAttribution(4, parent1, forker);
        attribution.createAttribution(5, parent2, forker);
        vm.stopPrank();
        
        uint256[] memory parentIds = new uint256[](2);
        parentIds[0] = parent1;
        parentIds[1] = parent2;
        
        uint256[][] memory childrenBatch = attribution.getChildrenBatch(parentIds);
        
        assertEq(childrenBatch.length, 2);
        assertEq(childrenBatch[0].length, 2); // parent1 has 2 children
        assertEq(childrenBatch[1].length, 1); // parent2 has 1 child
    }
    
    // ============ Failure Tests ============
    
    /**
     * @notice Test duplicate attribution rejection
     * @dev Verifies: cannot create attribution twice
     */
    function test_createAttribution_duplicate() public {
        uint256 codeId = 1;
        
        vm.prank(address(registry));
        attribution.createAttribution(codeId, 0, author);
        
        vm.prank(address(registry));
        vm.expectRevert(ICodeAttribution.AttributionAlreadyExists.selector);
        attribution.createAttribution(codeId, 0, author);
    }
    
    /**
     * @notice Test circular attribution prevention
     * @dev Verifies: cannot create circular parent relationship
     */
    function test_createAttribution_circular() public {
        uint256 codeA = 1;
        uint256 codeB = 2;
        
        vm.prank(address(registry));
        attribution.createAttribution(codeA, 0, author);
        
        vm.prank(address(registry));
        attribution.createAttribution(codeB, codeA, forker);
        
        // Try to make A's parent be B (circular)
        vm.prank(address(registry));
        vm.expectRevert(ICodeAttribution.CircularAttribution.selector);
        attribution.createAttribution(codeA, codeB, author);
    }
    
    /**
     * @notice Test zero address rejection
     * @dev Verifies: author cannot be zero address
     */
    function test_createAttribution_zeroAddress() public {
        vm.prank(address(registry));
        vm.expectRevert(ICodeAttribution.ZeroAddress.selector);
        attribution.createAttribution(1, 0, address(0));
    }
    
    /**
     * @notice Test invalid parent rejection
     * @dev Verifies: parent must exist
     */
    function test_createAttribution_invalidParent() public {
        vm.prank(address(registry));
        vm.expectRevert(ICodeAttribution.InvalidParentId.selector);
        attribution.createAttribution(1, 99, author);
    }
    
    /**
     * @notice Test invalid code ID rejection
     * @dev Verifies: code ID must be valid
     */
    function test_createAttribution_invalidCodeId() public {
        vm.prank(address(registry));
        vm.expectRevert(ICodeAttribution.InvalidCodeId.selector);
        attribution.createAttribution(0, 0, author);
    }
    
    /**
     * @notice Test attribution not found
     * @dev Verifies: querying non-existent attribution
     */
    function test_getAttribution_notFound() public {
        // Attribution with codeId 0 is default/empty
        ICodeAttribution.Attribution memory attr = attribution.getAttribution(999);
        assertEq(attr.codeId, 0);
    }
    
    // ============ Admin Tests ============
    
    function test_setCodeRegistry() public {
        address newRegistry = makeAddr("newRegistry");
        
        attribution.setCodeRegistry(newRegistry);
        
        // Verify by checking it doesn't revert
        // (in production, would verify more thoroughly)
    }
    
    function test_nonOwnerCannotSetRegistry() public {
        address newRegistry = makeAddr("newRegistry");
        
        vm.prank(forker);
        vm.expectRevert();
        attribution.setCodeRegistry(newRegistry);
    }
    
    // ============ Helper Functions ============
    
    // ============ Gas Optimization Notes ============
    // - BFS traversal for descendants limits depth to prevent gas issues
    // - Caching root codes saves gas on repeated lookups
    // - Batch operations reduce external call overhead
}
