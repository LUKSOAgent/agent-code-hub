// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IAgentRegistry.sol";
import "./utils/AccessControl.sol";
import "./utils/IdGenerator.sol";
import "./utils/StringUtils.sol";

/**
 * @title AgentRegistry
 * @notice Agent identity and reputation management with LUKSO Universal Profile integration
 */
contract AgentRegistry is IAgentRegistry, AccessControl {
    using StringUtils for string;
    
    // ============ Storage ============
    
    mapping(bytes32 => Agent) private _agents;
    mapping(address => bytes32) private _agentByUP;
    bytes32[] private _agentList;
    
    uint256 private _agentCounter;
    mapping(address => bool) private _verifiers;
    
    // ============ Modifiers ============
    
    modifier onlyAgentOwner(bytes32 agentId) {
        require(_agents[agentId].universalProfile == msg.sender || isAdmin(msg.sender), 
                "AgentRegistry: not agent owner");
        _;
    }
    
    modifier onlyVerifier() {
        require(_verifiers[msg.sender] || isAdmin(msg.sender), "AgentRegistry: not verifier");
        _;
    }
    
    modifier agentExists(bytes32 agentId) {
        require(_agents[agentId].id != bytes32(0), "AgentRegistry: agent not found");
        _;
    }
    
    modifier validAgentStatus(bytes32 agentId) {
        require(_agents[agentId].status == AgentStatus.Active, "AgentRegistry: agent not active");
        _;
    }
    
    // ============ External Functions ============
    
    function registerAgent(
        address universalProfile,
        string calldata name,
        string calldata metadataURI
    ) external override returns (bytes32 agentId) {
        require(universalProfile != address(0), "AgentRegistry: invalid UP address");
        require(!name.isEmpty(), "AgentRegistry: name required");
        require(_agentByUP[universalProfile] == bytes32(0), "AgentRegistry: UP already registered");
        
        _agentCounter++;
        agentId = IdGenerator.generateAgentId(universalProfile, _agentCounter);
        
        Agent storage agent = _agents[agentId];
        agent.id = agentId;
        agent.universalProfile = universalProfile;
        agent.name = name;
        agent.metadataURI = metadataURI;
        agent.reputationScore = 100; // Starting reputation
        agent.contributionCount = 0;
        agent.createdAt = block.timestamp;
        agent.lastActiveAt = block.timestamp;
        agent.status = AgentStatus.Active;
        agent.isVerified = false;
        
        _agentByUP[universalProfile] = agentId;
        _agentList.push(agentId);
        
        emit AgentRegistered(agentId, universalProfile, name, metadataURI, block.timestamp);
    }
    
    function updateAgentMetadata(
        bytes32 agentId,
        string calldata newMetadataURI
    ) external override agentExists(agentId) onlyAgentOwner(agentId) {
        _agents[agentId].metadataURI = newMetadataURI;
        _agents[agentId].lastActiveAt = block.timestamp;
        
        emit AgentUpdated(agentId, newMetadataURI, block.timestamp);
    }
    
    function addSkill(
        bytes32 agentId,
        string calldata skillName,
        uint8 proficiency
    ) external override agentExists(agentId) onlyAgentOwner(agentId) {
        require(proficiency > 0 && proficiency <= 100, "AgentRegistry: invalid proficiency");
        require(!skillName.isEmpty(), "AgentRegistry: skill name required");
        
        bytes32 skillHash = IdGenerator.generateSkillHash(skillName);
        
        Agent storage agent = _agents[agentId];
        
        // Add to skill list if new
        if (agent.skills[skillHash].skillHash == bytes32(0)) {
            agent.skillList.push(skillHash);
        }
        
        agent.skills[skillHash] = Skill({
            skillHash: skillHash,
            name: skillName,
            proficiency: proficiency,
            verifiedAt: 0,
            verifiedBy: address(0)
        });
        
        emit SkillAdded(agentId, skillHash, skillName, proficiency);
    }
    
    function updateReputation(
        bytes32 agentId,
        int256 delta,
        string calldata reason
    ) external override agentExists(agentId) onlyAgentRegistry {
        Agent storage agent = _agents[agentId];
        
        uint256 oldScore = agent.reputationScore;
        
        if (delta > 0) {
            agent.reputationScore += uint256(delta);
        } else if (delta < 0) {
            uint256 absDelta = uint256(-delta);
            if (absDelta >= agent.reputationScore) {
                agent.reputationScore = 0;
            } else {
                agent.reputationScore -= absDelta;
            }
        }
        
        agent.contributionCount++;
        agent.lastActiveAt = block.timestamp;
        
        emit ReputationUpdated(agentId, agent.reputationScore, delta, reason, block.timestamp);
    }
    
    function verifyAgent(bytes32 agentId) external override agentExists(agentId) onlyVerifier {
        _agents[agentId].isVerified = true;
        
        emit AgentVerified(agentId, msg.sender, block.timestamp);
    }
    
    function setAgentStatus(
        bytes32 agentId,
        AgentStatus newStatus
    ) external override agentExists(agentId) onlyAdmin {
        Agent storage agent = _agents[agentId];
        AgentStatus oldStatus = agent.status;
        agent.status = newStatus;
        
        emit AgentStatusChanged(agentId, oldStatus, newStatus);
    }
    
    function recordActivity(bytes32 agentId) external override agentExists(agentId) {
        _agents[agentId].lastActiveAt = block.timestamp;
    }
    
    // ============ Admin Functions ============
    
    function addVerifier(address verifier) external onlyAdmin {
        _verifiers[verifier] = true;
    }
    
    function removeVerifier(address verifier) external onlyAdmin {
        _verifiers[verifier] = false;
    }
    
    // ============ View Functions ============
    
    function getAgent(bytes32 agentId) external view override agentExists(agentId) returns (AgentView memory) {
        Agent storage agent = _agents[agentId];
        return AgentView({
            id: agent.id,
            universalProfile: agent.universalProfile,
            name: agent.name,
            metadataURI: agent.metadataURI,
            reputationScore: agent.reputationScore,
            contributionCount: agent.contributionCount,
            createdAt: agent.createdAt,
            lastActiveAt: agent.lastActiveAt,
            status: agent.status,
            isVerified: agent.isVerified
        });
    }
    
    function getAgentByUP(address universalProfile) external view override returns (AgentView memory) {
        bytes32 agentId = _agentByUP[universalProfile];
        require(agentId != bytes32(0), "AgentRegistry: UP not registered");
        return this.getAgent(agentId);
    }
    
    function getAgentSkill(bytes32 agentId, bytes32 skillHash) external view override agentExists(agentId) returns (Skill memory) {
        return _agents[agentId].skills[skillHash];
    }
    
    function getAgentSkills(bytes32 agentId) external view override agentExists(agentId) returns (bytes32[] memory) {
        return _agents[agentId].skillList;
    }
    
    function isRegistered(bytes32 agentId) external view override returns (bool) {
        return _agents[agentId].id != bytes32(0);
    }
    
    function isRegisteredByUP(address universalProfile) external view override returns (bool) {
        return _agentByUP[universalProfile] != bytes32(0);
    }
    
    function getAgentCount() external view override returns (uint256) {
        return _agentList.length;
    }
    
    function getAgentsByPage(uint256 page, uint256 pageSize) external view override returns (AgentView[] memory) {
        require(pageSize > 0, "AgentRegistry: invalid page size");
        
        uint256 start = page * pageSize;
        if (start >= _agentList.length) {
            return new AgentView[](0);
        }
        
        uint256 end = start + pageSize;
        if (end > _agentList.length) {
            end = _agentList.length;
        }
        
        AgentView[] memory result = new AgentView[](end - start);
        for (uint256 i = start; i < end; i++) {
            result[i - start] = this.getAgent(_agentList[i]);
        }
        
        return result;
    }
    
    function isVerifier(address account) external view returns (bool) {
        return _verifiers[account];
    }
}