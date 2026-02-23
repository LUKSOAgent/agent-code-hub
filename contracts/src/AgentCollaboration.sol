// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IAgentCollaboration.sol";
import "./interfaces/IAgentRegistry.sol";
import "./utils/AccessControl.sol";
import "./utils/IdGenerator.sol";
import "./utils/StringUtils.sol";

/**
 * @title AgentCollaboration
 * @notice Multi-agent project workspaces
 */
contract AgentCollaboration is IAgentCollaboration, AccessControl {
    using StringUtils for string;
    
    // ============ Storage ============
    
    mapping(bytes32 => Workspace) private _workspaces;
    mapping(bytes32 => Task) private _tasks;
    mapping(bytes32 => Proposal) private _proposals;
    mapping(bytes32 => Message) private _messages;
    mapping(bytes32 => bytes32[]) private _workspacesByAgent;
    mapping(bytes32 => bytes32[]) private _tasksByAssignee;
    
    bytes32[] private _allWorkspaces;
    
    IAgentRegistry public agentRegistry;
    
    uint256 private _workspaceCounter;
    uint256 private _taskCounter;
    uint256 private _proposalCounter;
    uint256 private _messageCounter;
    
    // ============ Modifiers ============
    
    modifier workspaceExists(bytes32 workspaceId) {
        require(_workspaces[workspaceId].id != bytes32(0), "AgentCollaboration: workspace not found");
        _;
    }
    
    modifier taskExists(bytes32 taskId) {
        require(_tasks[taskId].id != bytes32(0), "AgentCollaboration: task not found");
        _;
    }
    
    modifier proposalExists(bytes32 proposalId) {
        require(_proposals[proposalId].id != bytes32(0), "AgentCollaboration: proposal not found");
        _;
    }
    
    modifier validAgent(bytes32 agentId) {
        require(agentRegistry.isRegistered(agentId), "AgentCollaboration: agent not registered");
        _;
    }
    
    modifier hasRole(bytes32 workspaceId, AgentRole requiredRole) {
        require(_workspaces[workspaceId].agentRoles[_getAgentIdFromSender()] >= requiredRole || 
                isAdmin(msg.sender), "AgentCollaboration: insufficient role");
        _;
    }
    
    modifier isWorkspaceMember(bytes32 workspaceId) {
        require(_workspaces[workspaceId].agentRoles[_getAgentIdFromSender()] > AgentRole.None || 
                isAdmin(msg.sender), "AgentCollaboration: not a member");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _agentRegistry) {
        require(_agentRegistry != address(0), "AgentCollaboration: invalid agent registry");
        agentRegistry = IAgentRegistry(_agentRegistry);
    }
    
    // ============ Internal Functions ============
    
    function _getAgentIdFromSender() internal view returns (bytes32) {
        // Look up agent by UP address
        if (agentRegistry.isRegisteredByUP(msg.sender)) {
            IAgentRegistry.AgentView memory agent = agentRegistry.getAgentByUP(msg.sender);
            return agent.id;
        }
        return bytes32(0);
    }
    
    function _isWorkspaceAdmin(bytes32 workspaceId, bytes32 agentId) internal view returns (bool) {
        Workspace storage workspace = _workspaces[workspaceId];
        return workspace.agentRoles[agentId] >= AgentRole.Admin ||
               (workspace.agentRoles[agentId] >= AgentRole.Maintainer && workspace.workspaceType == WorkspaceType.OpenSource);
    }
    
    function _createWorkspaceId(bytes32 creatorAgentId) internal returns (bytes32) {
        _workspaceCounter++;
        return IdGenerator.generateWorkspaceId(creatorAgentId, block.timestamp, _workspaceCounter);
    }
    
    function _createTaskId(bytes32 workspaceId) internal returns (bytes32) {
        _taskCounter++;
        return IdGenerator.generateTaskId(workspaceId, _taskCounter, block.timestamp);
    }
    
    function _createProposalId(bytes32 workspaceId, bytes32 proposerAgentId) internal returns (bytes32) {
        _proposalCounter++;
        return IdGenerator.generateProposalId(workspaceId, proposerAgentId, block.timestamp, _proposalCounter);
    }
    
    function _createMessageId(bytes32 workspaceId, bytes32 authorAgentId) internal returns (bytes32) {
        _messageCounter++;
        return IdGenerator.generateMessageId(workspaceId, authorAgentId, block.timestamp, _messageCounter);
    }
    
    // ============ External Functions ============
    
    function createWorkspace(
        bytes32 creatorAgentId,
        string calldata name,
        string calldata description,
        string calldata metadataURI,
        WorkspaceType workspaceType,
        bytes32[] calldata initialAgents,
        AgentRole[] calldata initialRoles
    ) external override validAgent(creatorAgentId) returns (bytes32 workspaceId) {
        require(!name.isEmpty(), "AgentCollaboration: name required");
        require(initialAgents.length == initialRoles.length, "AgentCollaboration: mismatched arrays");
        
        workspaceId = _createWorkspaceId(creatorAgentId);
        
        Workspace storage workspace = _workspaces[workspaceId];
        workspace.id = workspaceId;
        workspace.creatorAgentId = creatorAgentId;
        workspace.name = name;
        workspace.description = description;
        workspace.metadataURI = metadataURI;
        workspace.workspaceType = workspaceType;
        workspace.createdAt = block.timestamp;
        workspace.updatedAt = block.timestamp;
        workspace.isActive = true;
        
        // Add creator as owner
        workspace.agentRoles[creatorAgentId] = AgentRole.Owner;
        workspace.agentList.push(creatorAgentId);
        _workspacesByAgent[creatorAgentId].push(workspaceId);
        
        // Add initial agents
        for (uint256 i = 0; i < initialAgents.length; i++) {
            if (initialAgents[i] != creatorAgentId && agentRegistry.isRegistered(initialAgents[i])) {
                workspace.invitedAgents[initialAgents[i]] = true;
            }
        }
        
        _allWorkspaces.push(workspaceId);
        
        // Update agent reputation
        agentRegistry.updateReputation(creatorAgentId, 10, "Workspace created");
        
        emit WorkspaceCreated(workspaceId, creatorAgentId, name, workspaceType, block.timestamp);
    }
    
    function inviteAgent(
        bytes32 workspaceId,
        bytes32 agentId,
        AgentRole role
    ) external override workspaceExists(workspaceId) validAgent(agentId) {
        bytes32 senderAgentId = _getAgentIdFromSender();
        require(_isWorkspaceAdmin(workspaceId, senderAgentId), "AgentCollaboration: not admin");
        require(role < AgentRole.Owner, "AgentCollaboration: cannot assign owner");
        
        _workspaces[workspaceId].invitedAgents[agentId] = true;
    }
    
    function joinWorkspace(bytes32 workspaceId, bytes32 agentId) external override workspaceExists(workspaceId) validAgent(agentId) {
        Workspace storage workspace = _workspaces[workspaceId];
        require(workspace.invitedAgents[agentId] || workspace.workspaceType == WorkspaceType.OpenSource, 
                "AgentCollaboration: not invited");
        require(workspace.agentRoles[agentId] == AgentRole.None, "AgentCollaboration: already member");
        
        AgentRole assignedRole = workspace.workspaceType == WorkspaceType.OpenSource ? AgentRole.Contributor : AgentRole.Viewer;
        
        workspace.agentRoles[agentId] = assignedRole;
        workspace.agentList.push(agentId);
        workspace.updatedAt = block.timestamp;
        
        _workspacesByAgent[agentId].push(workspaceId);
        
        emit AgentJoined(workspaceId, agentId, assignedRole, block.timestamp);
    }
    
    function leaveWorkspace(
        bytes32 workspaceId,
        bytes32 agentId,
        string calldata reason
    ) external override workspaceExists(workspaceId) validAgent(agentId) {
        Workspace storage workspace = _workspaces[workspaceId];
        require(workspace.agentRoles[agentId] != AgentRole.None, "AgentCollaboration: not a member");
        require(agentId != _getAgentIdFromSender() || workspace.agentRoles[agentId] < AgentRole.Owner, 
                "AgentCollaboration: owner cannot leave");
        
        workspace.agentRoles[agentId] = AgentRole.None;
        workspace.updatedAt = block.timestamp;
        
        // Note: We don't remove from agentList to preserve history
        
        emit AgentLeft(workspaceId, agentId, reason, block.timestamp);
    }
    
    function changeRole(
        bytes32 workspaceId,
        bytes32 agentId,
        AgentRole newRole
    ) external override workspaceExists(workspaceId) validAgent(agentId) {
        bytes32 senderAgentId = _getAgentIdFromSender();
        require(_isWorkspaceAdmin(workspaceId, senderAgentId), "AgentCollaboration: not admin");
        require(newRole <= _workspaces[workspaceId].agentRoles[senderAgentId], "AgentCollaboration: cannot assign higher role");
        
        Workspace storage workspace = _workspaces[workspaceId];
        AgentRole oldRole = workspace.agentRoles[agentId];
        workspace.agentRoles[agentId] = newRole;
        workspace.updatedAt = block.timestamp;
        
        emit RoleChanged(workspaceId, agentId, oldRole, newRole);
    }
    
    function createTask(
        bytes32 workspaceId,
        bytes32 creatorAgentId,
        string calldata title,
        string calldata descriptionIpfsHash,
        uint256 priority,
        uint256 deadline,
        bytes32[] calldata dependentTaskIds,
        bytes32 parentTaskId,
        uint256 reward,
        address rewardToken
    ) external override workspaceExists(workspaceId) validAgent(creatorAgentId) hasRole(workspaceId, AgentRole.Contributor) returns (bytes32 taskId) {
        require(!title.isEmpty(), "AgentCollaboration: title required");
        require(priority >= 1 && priority <= 5, "AgentCollaboration: priority must be 1-5");
        
        taskId = _createTaskId(workspaceId);
        
        Task storage task = _tasks[taskId];
        task.id = taskId;
        task.workspaceId = workspaceId;
        task.creatorAgentId = creatorAgentId;
        task.title = title;
        task.descriptionIpfsHash = descriptionIpfsHash;
        task.status = TaskStatus.Open;
        task.priority = priority;
        task.createdAt = block.timestamp;
        task.updatedAt = block.timestamp;
        task.deadline = deadline;
        task.dependentTaskIds = dependentTaskIds;
        task.parentTaskId = parentTaskId;
        task.reward = reward;
        task.rewardToken = rewardToken;
        
        _workspaces[workspaceId].taskIds.push(taskId);
        
        if (parentTaskId != bytes32(0)) {
            _tasks[parentTaskId].subtaskIds.push(taskId);
        }
        
        emit TaskCreated(workspaceId, taskId, creatorAgentId, title, deadline, block.timestamp);
    }
    
    function assignTask(bytes32 taskId, bytes32 assigneeAgentId) external override taskExists(taskId) validAgent(assigneeAgentId) {
        Task storage task = _tasks[taskId];
        Workspace storage workspace = _workspaces[task.workspaceId];
        bytes32 senderAgentId = _getAgentIdFromSender();
        
        require(
            workspace.agentRoles[senderAgentId] >= AgentRole.Maintainer ||
            task.creatorAgentId == senderAgentId ||
            assigneeAgentId == senderAgentId,
            "AgentCollaboration: not authorized"
        );
        require(workspace.agentRoles[assigneeAgentId] >= AgentRole.Contributor, "AgentCollaboration: assignee not member");
        
        task.assigneeAgentId = assigneeAgentId;
        task.status = TaskStatus.Assigned;
        task.updatedAt = block.timestamp;
        
        _tasksByAssignee[assigneeAgentId].push(taskId);
        
        emit TaskAssigned(taskId, assigneeAgentId, block.timestamp);
    }
    
    function updateTaskStatus(bytes32 taskId, TaskStatus newStatus) external override taskExists(taskId) {
        Task storage task = _tasks[taskId];
        bytes32 senderAgentId = _getAgentIdFromSender();
        Workspace storage workspace = _workspaces[task.workspaceId];
        
        require(
            task.assigneeAgentId == senderAgentId ||
            workspace.agentRoles[senderAgentId] >= AgentRole.Maintainer ||
            task.creatorAgentId == senderAgentId,
            "AgentCollaboration: not authorized"
        );
        
        TaskStatus oldStatus = task.status;
        task.status = newStatus;
        task.updatedAt = block.timestamp;
        
        emit TaskStatusChanged(taskId, oldStatus, newStatus, block.timestamp);
    }
    
    function completeTask(
        bytes32 taskId,
        bytes32 completerAgentId,
        string calldata resultIpfsHash
    ) external override taskExists(taskId) validAgent(completerAgentId) {
        Task storage task = _tasks[taskId];
        Workspace storage workspace = _workspaces[task.workspaceId];
        bytes32 senderAgentId = _getAgentIdFromSender();
        
        require(
            task.assigneeAgentId == senderAgentId ||
            workspace.agentRoles[senderAgentId] >= AgentRole.Maintainer,
            "AgentCollaboration: not authorized"
        );
        require(task.status == TaskStatus.InProgress || task.status == TaskStatus.UnderReview, "AgentCollaboration: task not in progress");
        
        // Check dependencies
        for (uint256 i = 0; i < task.dependentTaskIds.length; i++) {
            require(
                _tasks[task.dependentTaskIds[i]].status == TaskStatus.Completed,
                "AgentCollaboration: dependencies not complete"
            );
        }
        
        TaskStatus oldStatus = task.status;
        task.status = TaskStatus.Completed;
        task.completerAgentId = completerAgentId;
        task.resultIpfsHash = resultIpfsHash;
        task.completedAt = block.timestamp;
        task.updatedAt = block.timestamp;
        
        // Update agent reputation
        agentRegistry.updateReputation(completerAgentId, 10, "Task completed");
        
        emit TaskStatusChanged(taskId, oldStatus, TaskStatus.Completed, block.timestamp);
        emit TaskCompleted(taskId, completerAgentId, resultIpfsHash, block.timestamp);
    }
    
    function createProposal(
        bytes32 workspaceId,
        ProposalType proposalType,
        bytes32 proposerAgentId,
        string calldata title,
        string calldata descriptionIpfsHash,
        bytes calldata callData,
        address targetContract,
        uint256 votingDuration,
        uint256 quorumRequired,
        uint256 threshold
    ) external override workspaceExists(workspaceId) validAgent(proposerAgentId) hasRole(workspaceId, AgentRole.Contributor) returns (bytes32 proposalId) {
        require(!title.isEmpty(), "AgentCollaboration: title required");
        require(votingDuration >= 1 hours, "AgentCollaboration: voting too short");
        require(threshold > 0 && threshold <= 100, "AgentCollaboration: invalid threshold");
        
        proposalId = _createProposalId(workspaceId, proposerAgentId);
        
        Proposal storage proposal = _proposals[proposalId];
        proposal.id = proposalId;
        proposal.workspaceId = workspaceId;
        proposal.proposalType = proposalType;
        proposal.proposerAgentId = proposerAgentId;
        proposal.title = title;
        proposal.descriptionIpfsHash = descriptionIpfsHash;
        proposal.callData = callData;
        proposal.targetContract = targetContract;
        proposal.createdAt = block.timestamp;
        proposal.votingEndsAt = block.timestamp + votingDuration;
        proposal.status = ProposalStatus.Active;
        proposal.quorumRequired = quorumRequired;
        proposal.threshold = threshold;
        
        _workspaces[workspaceId].proposalIds.push(proposalId);
        
        emit ProposalCreated(workspaceId, proposalId, proposalType, proposerAgentId, block.timestamp);
    }
    
    function castVote(
        bytes32 proposalId,
        bytes32 voterAgentId,
        bool support
    ) external override proposalExists(proposalId) validAgent(voterAgentId) {
        Proposal storage proposal = _proposals[proposalId];
        Workspace storage workspace = _workspaces[proposal.workspaceId];
        
        require(proposal.status == ProposalStatus.Active, "AgentCollaboration: proposal not active");
        require(block.timestamp <= proposal.votingEndsAt, "AgentCollaboration: voting ended");
        require(!proposal.hasVoted[voterAgentId], "AgentCollaboration: already voted");
        require(workspace.agentRoles[voterAgentId] >= AgentRole.Contributor, "AgentCollaboration: not authorized to vote");
        
        uint256 votingPower = _getVotingPowerInternal(proposal.workspaceId, voterAgentId);
        require(votingPower > 0, "AgentCollaboration: no voting power");
        
        proposal.hasVoted[voterAgentId] = true;
        proposal.votePower[voterAgentId] = votingPower;
        proposal.voterList.push(voterAgentId);
        
        if (support) {
            proposal.votesFor += votingPower;
        } else {
            proposal.votesAgainst += votingPower;
        }
        
        emit VoteCast(proposalId, voterAgentId, support, votingPower, block.timestamp);
    }
    
    function executeProposal(bytes32 proposalId) external override proposalExists(proposalId) {
        Proposal storage proposal = _proposals[proposalId];
        Workspace storage workspace = _workspaces[proposal.workspaceId];
        
        require(proposal.status == ProposalStatus.Active, "AgentCollaboration: proposal not active");
        require(block.timestamp > proposal.votingEndsAt, "AgentCollaboration: voting not ended");
        
        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;
        bool quorumMet = totalVotes >= proposal.quorumRequired;
        bool thresholdMet = totalVotes > 0 && (proposal.votesFor * 100) / totalVotes >= proposal.threshold;
        
        if (quorumMet && thresholdMet) {
            proposal.status = ProposalStatus.Passed;
            
            // Execute if there's call data
            if (proposal.callData.length > 0 && proposal.targetContract != address(0)) {
                (bool success, ) = proposal.targetContract.call(proposal.callData);
                require(success, "AgentCollaboration: execution failed");
                proposal.status = ProposalStatus.Executed;
            }
        } else {
            proposal.status = ProposalStatus.Rejected;
        }
        
        proposal.executedAt = block.timestamp;
        
        emit ProposalExecuted(proposalId, proposal.status == ProposalStatus.Passed || proposal.status == ProposalStatus.Executed, block.timestamp);
    }
    
    function postMessage(
        bytes32 workspaceId,
        bytes32 authorAgentId,
        string calldata contentIpfsHash,
        bytes32 replyTo
    ) external override workspaceExists(workspaceId) validAgent(authorAgentId) isWorkspaceMember(workspaceId) returns (bytes32 messageId) {
        require(!contentIpfsHash.isEmpty(), "AgentCollaboration: content required");
        
        messageId = _createMessageId(workspaceId, authorAgentId);
        
        Message storage message = _messages[messageId];
        message.id = messageId;
        message.workspaceId = workspaceId;
        message.authorAgentId = authorAgentId;
        message.contentIpfsHash = contentIpfsHash;
        message.replyTo = replyTo;
        message.createdAt = block.timestamp;
        
        _workspaces[workspaceId].messageIds.push(messageId);
        
        emit MessagePosted(workspaceId, messageId, authorAgentId, replyTo, block.timestamp);
    }
    
    function linkCode(
        bytes32 workspaceId,
        bytes32 codeId,
        bytes32 linkedBy
    ) external override workspaceExists(workspaceId) validAgent(linkedBy) isWorkspaceMember(workspaceId) {
        _workspaces[workspaceId].linkedCodeIds.push(codeId);
        emit CodeLinked(workspaceId, codeId, linkedBy);
    }
    
    function recordMilestone(
        bytes32 workspaceId,
        string calldata milestoneName
    ) external override workspaceExists(workspaceId) hasRole(workspaceId, AgentRole.Maintainer) {
        Workspace storage workspace = _workspaces[workspaceId];
        workspace.milestoneNames.push(milestoneName);
        workspace.milestoneReachedAt.push(block.timestamp);
        workspace.updatedAt = block.timestamp;
        
        emit MilestoneReached(workspaceId, workspace.milestoneNames.length - 1, milestoneName, block.timestamp);
    }
    
    function closeWorkspace(bytes32 workspaceId) external override workspaceExists(workspaceId) {
        bytes32 senderAgentId = _getAgentIdFromSender();
        require(
            _workspaces[workspaceId].agentRoles[senderAgentId] == AgentRole.Owner ||
            isAdmin(msg.sender),
            "AgentCollaboration: not owner"
        );
        
        _workspaces[workspaceId].isActive = false;
        _workspaces[workspaceId].updatedAt = block.timestamp;
    }
    
    // ============ View Functions ============
    
    function getWorkspace(bytes32 workspaceId) external view override workspaceExists(workspaceId) returns (WorkspaceView memory) {
        Workspace storage workspace = _workspaces[workspaceId];
        return WorkspaceView({
            id: workspace.id,
            creatorAgentId: workspace.creatorAgentId,
            name: workspace.name,
            description: workspace.description,
            metadataURI: workspace.metadataURI,
            workspaceType: workspace.workspaceType,
            createdAt: workspace.createdAt,
            updatedAt: workspace.updatedAt,
            isActive: workspace.isActive,
            agentList: workspace.agentList,
            taskIds: workspace.taskIds,
            proposalIds: workspace.proposalIds,
            linkedCodeIds: workspace.linkedCodeIds,
            milestoneNames: workspace.milestoneNames,
            milestoneReachedAt: workspace.milestoneReachedAt
        });
    }
    
    function getTask(bytes32 taskId) external view override taskExists(taskId) returns (Task memory) {
        return _tasks[taskId];
    }
    
    function getProposal(bytes32 proposalId) external view override proposalExists(proposalId) returns (ProposalView memory) {
        Proposal storage proposal = _proposals[proposalId];
        return ProposalView({
            id: proposal.id,
            workspaceId: proposal.workspaceId,
            proposalType: proposal.proposalType,
            proposerAgentId: proposal.proposerAgentId,
            title: proposal.title,
            descriptionIpfsHash: proposal.descriptionIpfsHash,
            callData: proposal.callData,
            targetContract: proposal.targetContract,
            createdAt: proposal.createdAt,
            votingEndsAt: proposal.votingEndsAt,
            executedAt: proposal.executedAt,
            status: proposal.status,
            votesFor: proposal.votesFor,
            votesAgainst: proposal.votesAgainst,
            voterList: proposal.voterList,
            quorumRequired: proposal.quorumRequired,
            threshold: proposal.threshold
        });
    }
    
    function getMessage(bytes32 messageId) external view override returns (Message memory) {
        return _messages[messageId];
    }
    
    function getAgentRole(bytes32 workspaceId, bytes32 agentId) external view override workspaceExists(workspaceId) returns (AgentRole) {
        return _workspaces[workspaceId].agentRoles[agentId];
    }
    
    function getAgentInfo(bytes32 workspaceId, bytes32 agentId) external view override workspaceExists(workspaceId) returns (AgentInfo memory) {
        Workspace storage workspace = _workspaces[workspaceId];
        return AgentInfo({
            agentId: agentId,
            role: workspace.agentRoles[agentId],
            joinedAt: workspace.createdAt, // Simplified
            contributionScore: 0 // Would track in production
        });
    }
    
    function getWorkspaceAgents(bytes32 workspaceId) external view override workspaceExists(workspaceId) returns (AgentInfo[] memory) {
        Workspace storage workspace = _workspaces[workspaceId];
        AgentInfo[] memory agents = new AgentInfo[](workspace.agentList.length);
        
        for (uint256 i = 0; i < workspace.agentList.length; i++) {
            agents[i] = AgentInfo({
                agentId: workspace.agentList[i],
                role: workspace.agentRoles[workspace.agentList[i]],
                joinedAt: workspace.createdAt,
                contributionScore: 0
            });
        }
        
        return agents;
    }
    
    function getWorkspacesByAgent(bytes32 agentId) external view override returns (bytes32[] memory) {
        return _workspacesByAgent[agentId];
    }
    
    function getTasksByWorkspace(bytes32 workspaceId) external view override workspaceExists(workspaceId) returns (bytes32[] memory) {
        return _workspaces[workspaceId].taskIds;
    }
    
    function getTasksByAssignee(bytes32 assigneeAgentId) external view override returns (bytes32[] memory) {
        return _tasksByAssignee[assigneeAgentId];
    }
    
    function getProposalsByWorkspace(bytes32 workspaceId) external view override workspaceExists(workspaceId) returns (bytes32[] memory) {
        return _workspaces[workspaceId].proposalIds;
    }
    
    function getMessagesByWorkspace(bytes32 workspaceId, uint256 page, uint256 pageSize) external view override workspaceExists(workspaceId) returns (bytes32[] memory) {
        Workspace storage workspace = _workspaces[workspaceId];
        uint256 start = page * pageSize;
        if (start >= workspace.messageIds.length) return new bytes32[](0);
        
        uint256 end = start + pageSize;
        if (end > workspace.messageIds.length) end = workspace.messageIds.length;
        
        bytes32[] memory result = new bytes32[](end - start);
        for (uint256 i = start; i < end; i++) {
            result[i - start] = workspace.messageIds[workspace.messageIds.length - 1 - i]; // Reverse order (newest first)
        }
        return result;
    }
    
    function getThread(bytes32 messageId) external view override returns (bytes32[] memory) {
        // Get message chain (simplified - would traverse reply chain in production)
        bytes32[] memory thread = new bytes32[](1);
        thread[0] = messageId;
        return thread;
    }
    
    function hasVoted(bytes32 proposalId, bytes32 agentId) external view override proposalExists(proposalId) returns (bool) {
        return _proposals[proposalId].hasVoted[agentId];
    }
    
    function canExecute(bytes32 proposalId) external view override proposalExists(proposalId) returns (bool) {
        Proposal storage proposal = _proposals[proposalId];
        if (proposal.status != ProposalStatus.Active) return false;
        if (block.timestamp <= proposal.votingEndsAt) return false;
        
        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;
        bool quorumMet = totalVotes >= proposal.quorumRequired;
        bool thresholdMet = totalVotes > 0 && (proposal.votesFor * 100) / totalVotes >= proposal.threshold;
        return quorumMet && thresholdMet;
    }
    
    function getVotingPower(bytes32 workspaceId, bytes32 agentId) external view override workspaceExists(workspaceId) returns (uint256) {
        return _getVotingPowerInternal(workspaceId, agentId);
    }
    
    function _getVotingPowerInternal(bytes32 workspaceId, bytes32 agentId) internal view returns (uint256) {
        AgentRole role = _workspaces[workspaceId].agentRoles[agentId];
        if (role == AgentRole.None) return 0;
        if (role == AgentRole.Viewer) return 0;
        if (role == AgentRole.Contributor) return 1;
        if (role == AgentRole.Reviewer) return 2;
        if (role == AgentRole.Maintainer) return 4;
        if (role == AgentRole.Admin) return 8;
        if (role == AgentRole.Owner) return 16;
        return 0;
    }
}