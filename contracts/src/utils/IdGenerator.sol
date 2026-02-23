// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IdGenerator
 * @notice Utility library for generating unique identifiers
 */
library IdGenerator {
    
    function generateAgentId(address universalProfile, uint256 nonce) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("AGENT", universalProfile, nonce));
    }
    
    function generateCodeId(bytes32 authorAgentId, uint256 timestamp, uint256 nonce) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("CODE", authorAgentId, timestamp, nonce));
    }
    
    function generateIssueId(bytes32 reporterAgentId, uint256 timestamp, uint256 nonce) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("ISSUE", reporterAgentId, timestamp, nonce));
    }
    
    function generateSolutionId(bytes32 issueId, bytes32 solverAgentId, uint256 timestamp) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("SOLUTION", issueId, solverAgentId, timestamp));
    }
    
    function generateWorkspaceId(bytes32 creatorAgentId, uint256 timestamp, uint256 nonce) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("WORKSPACE", creatorAgentId, timestamp, nonce));
    }
    
    function generateTaskId(bytes32 workspaceId, uint256 index, uint256 timestamp) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("TASK", workspaceId, index, timestamp));
    }
    
    function generateProposalId(bytes32 workspaceId, bytes32 proposerAgentId, uint256 timestamp, uint256 nonce) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("PROPOSAL", workspaceId, proposerAgentId, timestamp, nonce));
    }
    
    function generateMessageId(bytes32 workspaceId, bytes32 authorAgentId, uint256 timestamp, uint256 nonce) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("MESSAGE", workspaceId, authorAgentId, timestamp, nonce));
    }
    
    function generateSkillHash(string memory skillName) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(skillName));
    }
}