// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IReputationToken} from "../interfaces/IReputationToken.sol";
import {ICodeRegistry} from "../interfaces/ICodeRegistry.sol";

/**
 * @title ReputationToken
 * @notice LSP7-compatible reputation token for the Agent Code Hub
 * @dev Non-transferable reputation token with level-based progression
 */
contract ReputationToken is IReputationToken, Ownable {
    
    // ============ State Variables ============
    
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    
    // Balances (LSP7 style: owner => balance)
    mapping(address => uint256) public balanceOf;
    
    // Operators (LSP7 feature)
    mapping(address => mapping(address => uint256)) public authorizedAmount;
    mapping(address => address[]) public operators;
    mapping(address => mapping(address => bool)) public isOperator;
    
    // Minters
    mapping(address => bool) public minters;
    
    // Voting
    mapping(uint256 => mapping(address => Vote)) public votes;
    mapping(uint256 => uint256) public upvoteCount;
    mapping(uint256 => uint256) public downvoteCount;
    mapping(address => uint256) public totalVotesByUser;
    
    // Levels
    UserLevel[] public levels;
    mapping(address => uint256) public userLevels;
    
    // Rewards
    uint256 public voteReward;
    uint256 public qualityRewardPool;
    mapping(address => uint256) public pendingRewards;
    
    // External contracts
    ICodeRegistry public codeRegistry;
    
    // Constants
    uint256 public constant MAX_LEVELS = 10;
    uint256 public constant VOTE_COOLDOWN = 1 days;
    
    // ============ Modifiers ============
    
    modifier onlyMinter() {
        if (!minters[msg.sender] && msg.sender != owner()) {
            revert UnauthorizedMinter();
        }
        _;
    }
    
    modifier validCode(uint256 codeId) {
        if (codeId == 0) revert InvalidCodeId();
        _;
    }
    
    // ============ Constructor ============
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        address _codeRegistry,
        uint256 _initialVoteReward
    ) Ownable(msg.sender) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        codeRegistry = ICodeRegistry(_codeRegistry);
        voteReward = _initialVoteReward;
        
        // Initialize default levels
        _addLevel(0, "Novice");
        _addLevel(100, "Apprentice");
        _addLevel(500, "Journeyman");
        _addLevel(1000, "Expert");
        _addLevel(2500, "Master");
        _addLevel(5000, "Grandmaster");
        _addLevel(10000, "Legend");
    }
    
    // ============ LSP7 Core Functions ============
    
    function authorizeOperator(address operator, uint256 amount) external override {
        authorizedAmount[msg.sender][operator] = amount;
        
        if (!isOperator[msg.sender][operator]) {
            isOperator[msg.sender][operator] = true;
            operators[msg.sender].push(operator);
        }
        
        emit AuthorizedOperator(operator, msg.sender, amount);
    }
    
    function revokeOperator(address operator) external override {
        authorizedAmount[msg.sender][operator] = 0;
        isOperator[msg.sender][operator] = false;
        
        // Remove from operators array
        address[] storage ops = operators[msg.sender];
        for (uint256 i = 0; i < ops.length; i++) {
            if (ops[i] == operator) {
                ops[i] = ops[ops.length - 1];
                ops.pop();
                break;
            }
        }
        
        emit RevokedOperator(operator, msg.sender);
    }
    
    function authorizedAmountFor(address operator, address tokenOwner) external view override returns (uint256) {
        return authorizedAmount[tokenOwner][operator];
    }
    
    function getOperatorsOf(address tokenOwner) external view override returns (address[] memory) {
        return operators[tokenOwner];
    }
    
    function transfer(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes calldata data
    ) external override {
        // Reputation tokens are non-transferable by default
        // Only operators/minters can move tokens (for rewards/penalties)
        if (from != msg.sender && !isOperator[from][msg.sender] && !minters[msg.sender] && msg.sender != owner()) {
            revert TransferNotAllowed();
        }
        
        if (from == to) revert InvalidAmount();
        if (balanceOf[from] < amount) revert InsufficientBalance();
        
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        
        // Check and update levels
        _checkLevelUp(to);
        
        emit Transfer(msg.sender, from, to, amount, force, data);
    }
    
    function transferBatch(
        address[] calldata from,
        address[] calldata to,
        uint256[] calldata amount,
        bool[] calldata force,
        bytes[] calldata data
    ) external override {
        if (from.length != to.length || from.length != amount.length) {
            revert InvalidAmount();
        }
        
        for (uint256 i = 0; i < from.length; i++) {
            this.transfer(from[i], to[i], amount[i], force[i], data[i]);
        }
    }
    
    // ============ Minting & Burning ============
    
    function mint(address to, uint256 amount, bool force, bytes calldata data) external override onlyMinter {
        _mint(to, amount, force, data);
    }
    
    function burn(address from, uint256 amount, bytes calldata data) external override {
        if (from != msg.sender && !minters[msg.sender] && msg.sender != owner()) {
            revert UnauthorizedMinter();
        }
        if (balanceOf[from] < amount) revert InsufficientBalance();
        
        balanceOf[from] -= amount;
        totalSupply -= amount;
        
        emit Transfer(msg.sender, from, address(0), amount, false, data);
    }
    
    // ============ Reputation-Specific Functions ============
    
    /**
     * @notice Mint reputation tokens to a user
     * @param to Address to mint to
     * @param amount Amount to mint
     * @param reason Reason for the reputation award
     */
    function mintReputation(address to, uint256 amount, string calldata reason) external override onlyMinter {
        _mint(to, amount, true, bytes(reason));
        emit ReputationMinted(to, amount, reason);
    }
    
    /**
     * @notice Upvote a code snippet and receive a small reward
     * @param codeId ID of the code to upvote
     * @return success Whether the upvote was successful
     */
    function upvoteCode(uint256 codeId) external override validCode(codeId) returns (bool) {
        // Check if already voted
        if (votes[codeId][msg.sender].timestamp != 0) {
            revert AlreadyVoted();
        }
        
        // Check self-voting
        try codeRegistry.getCodeSnippet(codeId) returns (ICodeRegistry.CodeSnippet memory code) {
            if (code.author == msg.sender) revert SelfVotingNotAllowed();
        } catch {
            revert InvalidCodeId();
        }
        
        // Record vote
        votes[codeId][msg.sender] = Vote({
            voter: msg.sender,
            codeId: codeId,
            weight: 1,
            timestamp: block.timestamp
        });
        
        upvoteCount[codeId]++;
        totalVotesByUser[msg.sender]++;
        
        // Award vote reward
        if (voteReward > 0) {
            pendingRewards[msg.sender] += voteReward;
        }
        
        emit CodeUpvoted(codeId, msg.sender, voteReward);
        return true;
    }
    
    /**
     * @notice Downvote a code snippet
     * @param codeId ID of the code to downvote
     * @return success Whether the downvote was successful
     */
    function downvoteCode(uint256 codeId) external override validCode(codeId) returns (bool) {
        // Check if already voted
        if (votes[codeId][msg.sender].timestamp != 0) {
            revert AlreadyVoted();
        }
        
        // Check self-voting
        try codeRegistry.getCodeSnippet(codeId) returns (ICodeRegistry.CodeSnippet memory code) {
            if (code.author == msg.sender) revert SelfVotingNotAllowed();
        } catch {
            revert InvalidCodeId();
        }
        
        // Record vote
        votes[codeId][msg.sender] = Vote({
            voter: msg.sender,
            codeId: codeId,
            weight: 0, // 0 indicates downvote
            timestamp: block.timestamp
        });
        
        downvoteCount[codeId]++;
        totalVotesByUser[msg.sender]++;
        
        emit CodeDownvoted(codeId, msg.sender);
        return true;
    }
    
    /**
     * @notice Distribute quality rewards to contributors
     * @param codeId ID of the high-quality code
     * @param contributors Array of contributor addresses
     * @param amounts Array of reward amounts
     */
    function rewardQuality(
        uint256 codeId,
        address[] calldata contributors,
        uint256[] calldata amounts
    ) external override onlyMinter validCode(codeId) {
        if (contributors.length != amounts.length) revert ArrayLengthMismatch();
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        if (totalAmount > qualityRewardPool) revert InsufficientBalance();
        
        qualityRewardPool -= totalAmount;
        
        for (uint256 i = 0; i < contributors.length; i++) {
            _mint(contributors[i], amounts[i], true, bytes("Quality reward"));
        }
        
        emit QualityRewardDistributed(codeId, contributors, amounts);
    }
    
    // ============ Level Functions ============
    
    function getUserLevel(address user) external view override returns (uint256) {
        return userLevels[user];
    }
    
    function getLevelThreshold(uint256 level) external view override returns (uint256) {
        if (level >= levels.length) revert InvalidLevel();
        return levels[level].threshold;
    }
    
    function getLevelName(uint256 level) external view override returns (string memory) {
        if (level >= levels.length) revert InvalidLevel();
        return levels[level].name;
    }
    
    function addLevel(uint256 threshold, string calldata name) external override onlyOwner {
        if (levels.length >= MAX_LEVELS) revert InvalidLevel();
        _addLevel(threshold, name);
    }
    
    function updateLevel(uint256 level, uint256 threshold, string calldata name) external override onlyOwner {
        if (level >= levels.length) revert InvalidLevel();
        levels[level] = UserLevel({
            level: level,
            threshold: threshold,
            name: name
        });
    }
    
    // ============ View Functions ============
    
    function hasVoted(uint256 codeId, address voter) external view override returns (bool) {
        return votes[codeId][voter].timestamp != 0;
    }
    
    function getVote(uint256 codeId, address voter) external view override returns (Vote memory) {
        return votes[codeId][voter];
    }
    
    function getCodeVoteCount(uint256 codeId) external view override returns (uint256 upvotes, uint256 downvotes) {
        return (upvoteCount[codeId], downvoteCount[codeId]);
    }
    
    function getTotalVotesByUser(address user) external view override returns (uint256) {
        return totalVotesByUser[user];
    }
    
    function getPendingRewards(address user) external view override returns (uint256) {
        return pendingRewards[user];
    }
    
    // ============ Admin Functions ============
    
    function setVoteReward(uint256 newReward) external override onlyOwner {
        uint256 oldReward = voteReward;
        voteReward = newReward;
        emit VoteRewardUpdated(oldReward, newReward);
    }
    
    function setQualityRewardPool(uint256 newPool) external override onlyOwner {
        uint256 oldPool = qualityRewardPool;
        qualityRewardPool = newPool;
        emit QualityRewardPoolUpdated(oldPool, newPool);
    }
    
    function addMinter(address minter) external override onlyOwner {
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    function removeMinter(address minter) external override onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    function isMinter(address account) external view override returns (bool) {
        return minters[account];
    }
    
    function withdrawUnusedRewards() external override onlyOwner {
        uint256 amount = qualityRewardPool;
        qualityRewardPool = 0;
        _mint(owner(), amount, true, bytes("Withdrawal"));
    }
    
    function setCodeRegistry(address _codeRegistry) external onlyOwner {
        codeRegistry = ICodeRegistry(_codeRegistry);
    }
    
    // ============ Internal Functions ============
    
    function _mint(address to, uint256 amount, bool force, bytes memory data) internal {
        if (to == address(0)) revert InvalidAmount();
        
        balanceOf[to] += amount;
        totalSupply += amount;
        
        _checkLevelUp(to);
        
        emit Transfer(msg.sender, address(0), to, amount, force, data);
    }
    
    function _addLevel(uint256 threshold, string memory levelName) internal {
        levels.push(UserLevel({
            level: levels.length,
            threshold: threshold,
            name: levelName
        }));
    }
    
    function _checkLevelUp(address user) internal {
        uint256 balance = balanceOf[user];
        uint256 currentLevel = userLevels[user];
        uint256 newLevel = currentLevel;
        
        // Find the highest level the user qualifies for
        for (uint256 i = currentLevel + 1; i < levels.length; i++) {
            if (balance >= levels[i].threshold) {
                newLevel = i;
            } else {
                break;
            }
        }
        
        if (newLevel > currentLevel) {
            userLevels[user] = newLevel;
            emit UserLevelChanged(user, currentLevel, newLevel);
        }
    }
    
    // ============ Data Changed Event (LSP7) ============
    
    function _setData(bytes32 dataKey, bytes calldata dataValue) internal {
        emit DataChanged(dataKey, dataValue);
    }
}
