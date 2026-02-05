// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ILSP7DigitalAsset.sol";

/**
 * @title IReputationToken
 * @notice Interface for the reputation token contract (LSP7-based)
 */
interface IReputationToken is ILSP7DigitalAsset {
    // Structs
    struct UserLevel {
        uint256 level;
        uint256 threshold;
        string name;
    }

    struct Vote {
        address voter;
        uint256 codeId;
        uint256 weight;
        uint256 timestamp;
    }

    // Events
    event ReputationMinted(address indexed user, uint256 amount, string reason);
    event CodeUpvoted(uint256 indexed codeId, address indexed voter, uint256 reward);
    event CodeDownvoted(uint256 indexed codeId, address indexed voter);
    event QualityRewardDistributed(uint256 indexed codeId, address[] recipients, uint256[] amounts);
    event UserLevelChanged(address indexed user, uint256 oldLevel, uint256 newLevel);
    event VoteRewardUpdated(uint256 oldReward, uint256 newReward);
    event QualityRewardPoolUpdated(uint256 oldPool, uint256 newPool);
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);

    // Core functions
    function mintReputation(address to, uint256 amount, string calldata reason) external;
    function upvoteCode(uint256 codeId) external returns (bool);
    function downvoteCode(uint256 codeId) external returns (bool);
    function rewardQuality(uint256 codeId, address[] calldata contributors, uint256[] calldata amounts) external;
    
    // View functions
    function getUserLevel(address user) external view returns (uint256);
    function getLevelThreshold(uint256 level) external view returns (uint256);
    function getLevelName(uint256 level) external view returns (string memory);
    function hasVoted(uint256 codeId, address voter) external view returns (bool);
    function getVote(uint256 codeId, address voter) external view returns (Vote memory);
    function getCodeVoteCount(uint256 codeId) external view returns (uint256 upvotes, uint256 downvotes);
    function getTotalVotesByUser(address user) external view returns (uint256);
    function getPendingRewards(address user) external view returns (uint256);
    
    // Level configuration
    function addLevel(uint256 threshold, string calldata name) external;
    function updateLevel(uint256 level, uint256 threshold, string calldata name) external;

    // Admin functions
    function setVoteReward(uint256 newReward) external;
    function setQualityRewardPool(uint256 newPool) external;
    function addMinter(address minter) external;
    function removeMinter(address minter) external;
    function isMinter(address account) external view returns (bool);
    function withdrawUnusedRewards() external;

    // Error definitions
    error InvalidAmount();
    error AlreadyVoted();
    error SelfVotingNotAllowed();
    error InvalidCodeId();
    error InsufficientBalance();
    error UnauthorizedMinter();
    error InvalidLevel();
    error ArrayLengthMismatch();
    error NoRewardsToClaim();
    error TransferNotAllowed();
}
