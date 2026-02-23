// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IAgentCollaboration
 * @notice Interface for multi-agent project workspaces
 */
interface IAgentCollaboration {
    // ============ Events ============
    event WorkspaceCreated(
        bytes32 indexed workspaceId,
        bytes32 indexed creatorAgentId,
        string name,
        WorkspaceType workspaceType,
        uint256 timestamp
    );
    
    event AgentJoined(
        bytes32 indexed workspaceId,
        bytes32 indexed agentId,
        AgentRole role,
        uint256 timestamp
    );
    
    event AgentLeft(
        bytes32 indexed workspaceId,
        bytes32 indexed agentId,
        string reason,
        uint256 timestamp
    );
    
    event RoleChanged(
        bytes32 indexed workspaceId,
        bytes32 indexed agentId,
        AgentRole oldRole,
        AgentRole newRole
    );
    
    event TaskCreated(
        bytes32 indexed workspaceId,
        bytes32 indexed taskId,
        bytes32 indexed creatorAgentId,
        string title,
        uint256 deadline,
        uint256 timestamp
    );
    
    event TaskAssigned(
        bytes32 indexed taskId,
        bytes32 indexed assigneeAgentId,
        uint256 timestamp
    );
    
    event TaskStatusChanged(
        bytes32 indexed taskId,
        TaskStatus oldStatus,
        TaskStatus newStatus,
        uint256 timestamp
    );
    
    event TaskCompleted(
        bytes32 indexed taskId,
        bytes32 indexed completerAgentId,
        string resultIpfsHash,
        uint256 timestamp
    );
    
    event ProposalCreated(
        bytes32 indexed workspaceId,
        bytes32 indexed proposalId,
        ProposalType proposalType,
        bytes32 indexed proposerAgentId,
        uint256 timestamp
    );
    
    event VoteCast(
        bytes32 indexed proposalId,
        bytes32 indexed voterAgentId,
        bool support,
        uint256 votingPower,
        uint256 timestamp
    );
    
    event ProposalExecuted(
        bytes32 indexed proposalId,
        bool passed,
        uint256 timestamp
    );
    
    event MessagePosted(
        bytes32 indexed workspaceId,
        bytes32 indexed messageId,
        bytes32 indexed authorAgentId,
        bytes32 replyTo,
        uint256 timestamp
    );
    
    event CodeLinked(
        bytes32 indexed workspaceId,
        bytes32 indexed codeId,
        bytes32 indexed linkedBy
    );
    
    event MilestoneReached(
        bytes32 indexed workspaceId,
        uint256 milestoneIndex,
        string milestoneName,
        uint256 timestamp
    );

    // ============ Enums ============
    enum WorkspaceType {
        OpenSource,
        Private,
        Bounty,
        Competition,
        Research,
        Maintenance
    }
    
    enum AgentRole {
        None,
        Viewer,
        Contributor,
        Reviewer,
        Maintainer,
        Admin,
        Owner
    }
    
    enum TaskStatus {
        Draft,
        Open,
        Assigned,
        InProgress,
        UnderReview,
        Completed,
        Cancelled
    }
    
    enum ProposalType {
        General,
        CodeMerge,
        AgentPromotion,
        PolicyChange,
        ResourceAllocation,
        WorkspaceClosure
    }
    
    enum ProposalStatus {
        Active,
        Passed,
        Rejected,
        Executed,
        Cancelled
    }

    // ============ Structs ============
    struct Workspace {
        bytes32 id;
        bytes32 creatorAgentId;
        string name;
        string description;
        string metadataURI;
        WorkspaceType workspaceType;
        uint256 createdAt;
        uint256 updatedAt;
        bool isActive;
        mapping(bytes32 => AgentRole) agentRoles;
        bytes32[] agentList;
        bytes32[] taskIds;
        bytes32[] proposalIds;
        bytes32[] linkedCodeIds;
        bytes32[] messageIds;
        string[] milestoneNames;
        uint256[] milestoneReachedAt;
        mapping(bytes32 => bool) invitedAgents;
    }
    
    struct WorkspaceView {
        bytes32 id;
        bytes32 creatorAgentId;
        string name;
        string description;
        string metadataURI;
        WorkspaceType workspaceType;
        uint256 createdAt;
        uint256 updatedAt;
        bool isActive;
        bytes32[] agentList;
        bytes32[] taskIds;
        bytes32[] proposalIds;
        bytes32[] linkedCodeIds;
        string[] milestoneNames;
        uint256[] milestoneReachedAt;
    }
    
    struct Task {
        bytes32 id;
        bytes32 workspaceId;
        bytes32 creatorAgentId;
        bytes32 assigneeAgentId;
        bytes32 completerAgentId;
        string title;
        string descriptionIpfsHash;
        TaskStatus status;
        uint256 priority; // 1-5
        uint256 createdAt;
        uint256 updatedAt;
        uint256 deadline;
        uint256 completedAt;
        string resultIpfsHash;
        bytes32[] dependentTaskIds;
        bytes32[] relatedCodeIds;
        bytes32 parentTaskId;
        bytes32[] subtaskIds;
        uint256 reward;
        address rewardToken;
    }
    
    struct Proposal {
        bytes32 id;
        bytes32 workspaceId;
        ProposalType proposalType;
        bytes32 proposerAgentId;
        string title;
        string descriptionIpfsHash;
        bytes callData; // For executable proposals
        address targetContract;
        uint256 createdAt;
        uint256 votingEndsAt;
        uint256 executedAt;
        ProposalStatus status;
        uint256 votesFor;
        uint256 votesAgainst;
        mapping(bytes32 => bool) hasVoted;
        mapping(bytes32 => uint256) votePower;
        bytes32[] voterList;
        uint256 quorumRequired;
        uint256 threshold; // Percentage needed to pass (e.g., 51 = 51%)
    }
    
    struct ProposalView {
        bytes32 id;
        bytes32 workspaceId;
        ProposalType proposalType;
        bytes32 proposerAgentId;
        string title;
        string descriptionIpfsHash;
        bytes callData;
        address targetContract;
        uint256 createdAt;
        uint256 votingEndsAt;
        uint256 executedAt;
        ProposalStatus status;
        uint256 votesFor;
        uint256 votesAgainst;
        bytes32[] voterList;
        uint256 quorumRequired;
        uint256 threshold;
    }
    
    struct Message {
        bytes32 id;
        bytes32 workspaceId;
        bytes32 authorAgentId;
        string contentIpfsHash;
        bytes32 replyTo; // Message this replies to (0 if none)
        uint256 createdAt;
        bool isEdited;
        uint256 editedAt;
    }
    
    struct AgentInfo {
        bytes32 agentId;
        AgentRole role;
        uint256 joinedAt;
        uint256 contributionScore;
    }

    // ============ External Functions ============
    
    /**
     * @notice Create a new workspace
     * @param creatorAgentId Creator agent
     * @param name Workspace name
     * @param description Description
     * @param metadataURI IPFS metadata URI
     * @param workspaceType Type of workspace
     * @param initialAgents Initial agents to invite
     * @param initialRoles Roles for initial agents
     * @return workspaceId Unique workspace identifier
     */
    function createWorkspace(
        bytes32 creatorAgentId,
        string calldata name,
        string calldata description,
        string calldata metadataURI,
        WorkspaceType workspaceType,
        bytes32[] calldata initialAgents,
        AgentRole[] calldata initialRoles
    ) external returns (bytes32 workspaceId);
    
    /**
     * @notice Invite agent to workspace
     * @param workspaceId Workspace identifier
     * @param agentId Agent to invite
     * @param role Role to assign
     */
    function inviteAgent(
        bytes32 workspaceId,
        bytes32 agentId,
        AgentRole role
    ) external;
    
    /**
     * @notice Accept workspace invitation
     * @param workspaceId Workspace identifier
     * @param agentId Joining agent
     */
    function joinWorkspace(bytes32 workspaceId, bytes32 agentId) external;
    
    /**
     * @notice Leave workspace
     * @param workspaceId Workspace identifier
     * @param agentId Leaving agent
     * @param reason Reason for leaving
     */
    function leaveWorkspace(
        bytes32 workspaceId,
        bytes32 agentId,
        string calldata reason
    ) external;
    
    /**
     * @notice Change agent role
     * @param workspaceId Workspace identifier
     * @param agentId Target agent
     * @param newRole New role
     */
    function changeRole(
        bytes32 workspaceId,
        bytes32 agentId,
        AgentRole newRole
    ) external;
    
    /**
     * @notice Create a task
     * @param workspaceId Workspace identifier
     * @param creatorAgentId Creating agent
     * @param title Task title
     * @param descriptionIpfsHash IPFS hash of description
     * @param priority Priority level (1-5)
     * @param deadline Deadline timestamp
     * @param dependentTaskIds Tasks this depends on
     * @param parentTaskId Parent task (0 if none)
     * @param reward Reward amount
     * @param rewardToken Reward token (0 for native)
     * @return taskId Unique task identifier
     */
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
    ) external returns (bytes32 taskId);
    
    /**
     * @notice Assign task to agent
     * @param taskId Task identifier
     * @param assigneeAgentId Agent to assign
     */
    function assignTask(bytes32 taskId, bytes32 assigneeAgentId) external;
    
    /**
     * @notice Update task status
     * @param taskId Task identifier
     * @param newStatus New status
     */
    function updateTaskStatus(bytes32 taskId, TaskStatus newStatus) external;
    
    /**
     * @notice Complete task
     * @param taskId Task identifier
     * @param completerAgentId Completing agent
     * @param resultIpfsHash IPFS hash of result
     */
    function completeTask(
        bytes32 taskId,
        bytes32 completerAgentId,
        string calldata resultIpfsHash
    ) external;
    
    /**
     * @notice Create proposal
     * @param workspaceId Workspace identifier
     * @param proposalType Type of proposal
     * @param proposerAgentId Proposing agent
     * @param title Proposal title
     * @param descriptionIpfsHash IPFS hash of description
     * @param callData Executable call data
     * @param targetContract Target contract for execution
     * @param votingDuration Duration of voting period
     * @param quorumRequired Minimum votes required
     * @param threshold Percentage to pass (51 = 51%)
     * @return proposalId Unique proposal identifier
     */
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
    ) external returns (bytes32 proposalId);
    
    /**
     * @notice Cast vote on proposal
     * @param proposalId Proposal identifier
     * @param voterAgentId Voting agent
     * @param support True for yes, false for no
     */
    function castVote(
        bytes32 proposalId,
        bytes32 voterAgentId,
        bool support
    ) external;
    
    /**
     * @notice Execute passed proposal
     * @param proposalId Proposal identifier
     */
    function executeProposal(bytes32 proposalId) external;
    
    /**
     * @notice Post message to workspace
     * @param workspaceId Workspace identifier
     * @param authorAgentId Author agent
     * @param contentIpfsHash IPFS hash of content
     * @param replyTo Message being replied to (0 if none)
     * @return messageId Unique message identifier
     */
    function postMessage(
        bytes32 workspaceId,
        bytes32 authorAgentId,
        string calldata contentIpfsHash,
        bytes32 replyTo
    ) external returns (bytes32 messageId);
    
    /**
     * @notice Link code to workspace
     * @param workspaceId Workspace identifier
     * @param codeId Code to link
     * @param linkedBy Agent linking the code
     */
    function linkCode(
        bytes32 workspaceId,
        bytes32 codeId,
        bytes32 linkedBy
    ) external;
    
    /**
     * @notice Record milestone reached
     * @param workspaceId Workspace identifier
     * @param milestoneName Milestone name
     */
    function recordMilestone(
        bytes32 workspaceId,
        string calldata milestoneName
    ) external;
    
    /**
     * @notice Close workspace
     * @param workspaceId Workspace identifier
     */
    function closeWorkspace(bytes32 workspaceId) external;
    
    // ============ View Functions ============
    
    function getWorkspace(bytes32 workspaceId) external view returns (WorkspaceView memory);
    function getTask(bytes32 taskId) external view returns (Task memory);
    function getProposal(bytes32 proposalId) external view returns (ProposalView memory);
    function getMessage(bytes32 messageId) external view returns (Message memory);
    function getAgentRole(bytes32 workspaceId, bytes32 agentId) external view returns (AgentRole);
    function getAgentInfo(bytes32 workspaceId, bytes32 agentId) external view returns (AgentInfo memory);
    function getWorkspaceAgents(bytes32 workspaceId) external view returns (AgentInfo[] memory);
    function getWorkspacesByAgent(bytes32 agentId) external view returns (bytes32[] memory);
    function getTasksByWorkspace(bytes32 workspaceId) external view returns (bytes32[] memory);
    function getTasksByAssignee(bytes32 assigneeAgentId) external view returns (bytes32[] memory);
    function getProposalsByWorkspace(bytes32 workspaceId) external view returns (bytes32[] memory);
    function getMessagesByWorkspace(bytes32 workspaceId, uint256 page, uint256 pageSize) external view returns (bytes32[] memory);
    function getThread(bytes32 messageId) external view returns (bytes32[] memory);
    function hasVoted(bytes32 proposalId, bytes32 agentId) external view returns (bool);
    function canExecute(bytes32 proposalId) external view returns (bool);
    function getVotingPower(bytes32 workspaceId, bytes32 agentId) external view returns (uint256);
}