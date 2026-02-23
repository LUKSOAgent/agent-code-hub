// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IAgentRegistry
 * @notice Interface for Agent identity and reputation management with LUKSO Universal Profile integration
 */
interface IAgentRegistry {
    // ============ Events ============
    event AgentRegistered(
        bytes32 indexed agentId,
        address indexed universalProfile,
        string name,
        string metadataURI,
        uint256 timestamp
    );
    
    event AgentUpdated(
        bytes32 indexed agentId,
        string newMetadataURI,
        uint256 timestamp
    );
    
    event ReputationUpdated(
        bytes32 indexed agentId,
        uint256 newScore,
        int256 change,
        string reason,
        uint256 timestamp
    );
    
    event SkillAdded(
        bytes32 indexed agentId,
        bytes32 indexed skillHash,
        string skillName,
        uint8 proficiency
    );
    
    event AgentVerified(
        bytes32 indexed agentId,
        address indexed verifier,
        uint256 timestamp
    );
    
    event AgentStatusChanged(
        bytes32 indexed agentId,
        AgentStatus oldStatus,
        AgentStatus newStatus
    );

    // ============ Enums ============
    enum AgentStatus {
        Inactive,
        Active,
        Suspended,
        Banned
    }

    // ============ Structs ============
    struct Agent {
        bytes32 id;
        address universalProfile;
        string name;
        string metadataURI;
        uint256 reputationScore;
        uint256 contributionCount;
        uint256 createdAt;
        uint256 lastActiveAt;
        AgentStatus status;
        bool isVerified;
        mapping(bytes32 => Skill) skills;
        bytes32[] skillList;
    }
    
    struct AgentView {
        bytes32 id;
        address universalProfile;
        string name;
        string metadataURI;
        uint256 reputationScore;
        uint256 contributionCount;
        uint256 createdAt;
        uint256 lastActiveAt;
        AgentStatus status;
        bool isVerified;
    }
    
    struct Skill {
        bytes32 skillHash;
        string name;
        uint8 proficiency; // 1-100
        uint256 verifiedAt;
        address verifiedBy;
    }

    // ============ External Functions ============
    
    /**
     * @notice Register a new agent with Universal Profile
     * @param universalProfile Address of the LUKSO Universal Profile
     * @param name Agent display name
     * @param metadataURI IPFS URI containing agent metadata
     * @return agentId Unique identifier for the registered agent
     */
    function registerAgent(
        address universalProfile,
        string calldata name,
        string calldata metadataURI
    ) external returns (bytes32 agentId);
    
    /**
     * @notice Update agent metadata
     * @param agentId Agent identifier
     * @param newMetadataURI New IPFS metadata URI
     */
    function updateAgentMetadata(
        bytes32 agentId,
        string calldata newMetadataURI
    ) external;
    
    /**
     * @notice Add or update a skill for an agent
     * @param agentId Agent identifier
     * @param skillName Skill name
     * @param proficiency Proficiency level (1-100)
     */
    function addSkill(
        bytes32 agentId,
        string calldata skillName,
        uint8 proficiency
    ) external;
    
    /**
     * @notice Update agent reputation score
     * @param agentId Agent identifier
     * @param delta Reputation change (positive or negative)
     * @param reason Reason for the change
     */
    function updateReputation(
        bytes32 agentId,
        int256 delta,
        string calldata reason
    ) external;
    
    /**
     * @notice Verify an agent (only callable by verifiers)
     * @param agentId Agent identifier
     */
    function verifyAgent(bytes32 agentId) external;
    
    /**
     * @notice Change agent status (only callable by admin)
     * @param agentId Agent identifier
     * @param newStatus New status to set
     */
    function setAgentStatus(bytes32 agentId, AgentStatus newStatus) external;
    
    /**
     * @notice Record agent activity
     * @param agentId Agent identifier
     */
    function recordActivity(bytes32 agentId) external;
    
    // ============ View Functions ============
    
    function getAgent(bytes32 agentId) external view returns (AgentView memory);
    function getAgentByUP(address universalProfile) external view returns (AgentView memory);
    function getAgentSkill(bytes32 agentId, bytes32 skillHash) external view returns (Skill memory);
    function getAgentSkills(bytes32 agentId) external view returns (bytes32[] memory);
    function isRegistered(bytes32 agentId) external view returns (bool);
    function isRegisteredByUP(address universalProfile) external view returns (bool);
    function getAgentCount() external view returns (uint256);
    function getAgentsByPage(uint256 page, uint256 pageSize) external view returns (AgentView[] memory);
}