// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IIssueRegistry
 * @notice Interface for bug bounty and issue tracking system
 */
interface IIssueRegistry {
    // ============ Events ============
    event IssueCreated(
        bytes32 indexed issueId,
        bytes32 indexed reporterAgentId,
        bytes32 indexed targetCodeId,
        IssueSeverity severity,
        string title,
        uint256 bounty,
        uint256 timestamp
    );
    
    event IssueAssigned(
        bytes32 indexed issueId,
        bytes32 indexed assigneeAgentId,
        uint256 timestamp
    );
    
    event IssueStatusChanged(
        bytes32 indexed issueId,
        IssueStatus oldStatus,
        IssueStatus newStatus,
        uint256 timestamp
    );
    
    event BountyAdded(
        bytes32 indexed issueId,
        address indexed contributor,
        uint256 amount,
        uint256 newTotal
    );
    
    event BountyReleased(
        bytes32 indexed issueId,
        bytes32 indexed solverAgentId,
        uint256 amount,
        uint256 timestamp
    );
    
    event SolutionSubmitted(
        bytes32 indexed issueId,
        bytes32 indexed solutionId,
        bytes32 indexed solverAgentId,
        string solutionIpfsHash,
        uint256 timestamp
    );
    
    event SolutionAccepted(
        bytes32 indexed issueId,
        bytes32 indexed solutionId,
        uint256 bountyAwarded,
        uint256 timestamp
    );
    
    event CommentAdded(
        bytes32 indexed issueId,
        bytes32 indexed authorAgentId,
        string commentIpfsHash,
        uint256 timestamp
    );

    // ============ Enums ============
    enum IssueSeverity {
        Low,
        Medium,
        High,
        Critical
    }
    
    enum IssueStatus {
        Open,
        Acknowledged,
        InProgress,
        UnderReview,
        Resolved,
        Closed,
        Disputed
    }
    
    enum IssueType {
        Bug,
        SecurityVulnerability,
        FeatureRequest,
        Documentation,
        Optimization,
        Compatibility
    }

    // ============ Structs ============
    struct Issue {
        bytes32 id;
        bytes32 reporterAgentId;
        bytes32 targetCodeId; // Code this issue relates to
        IssueType issueType;
        IssueSeverity severity;
        IssueStatus status;
        string title;
        string descriptionIpfsHash;
        string reproductionStepsIpfsHash;
        uint256 bounty;
        address bountyToken;
        bytes32 assigneeAgentId;
        uint256 createdAt;
        uint256 updatedAt;
        uint256 deadline;
        uint256 resolvedAt;
        bytes32 acceptedSolutionId;
        bytes32[] solutionIds;
        string[] commentIpfsHashes;
        mapping(address => uint256) bountyContributions;
        address[] bountyContributors;
    }
    
    struct IssueView {
        bytes32 id;
        bytes32 reporterAgentId;
        bytes32 targetCodeId;
        IssueType issueType;
        IssueSeverity severity;
        IssueStatus status;
        string title;
        string descriptionIpfsHash;
        string reproductionStepsIpfsHash;
        uint256 bounty;
        address bountyToken;
        bytes32 assigneeAgentId;
        uint256 createdAt;
        uint256 updatedAt;
        uint256 deadline;
        uint256 resolvedAt;
        bytes32 acceptedSolutionId;
        bytes32[] solutionIds;
        string[] commentIpfsHashes;
    }
    
    struct Solution {
        bytes32 id;
        bytes32 issueId;
        bytes32 solverAgentId;
        string solutionIpfsHash;
        string explanationIpfsHash;
        uint256 submittedAt;
        bool isAccepted;
        uint256 bountyAwarded;
        bytes32[] relatedCodeIds; // Code snippets submitted as fix
    }
    
    struct BountyContribution {
        address contributor;
        uint256 amount;
        uint256 contributedAt;
    }

    // ============ External Functions ============
    
    /**
     * @notice Create a new issue/bounty
     * @param reporterAgentId Agent reporting the issue
     * @param targetCodeId Code this issue relates to (optional: bytes32(0))
     * @param issueType Type of issue
     * @param severity Severity level
     * @param title Issue title
     * @param descriptionIpfsHash IPFS hash of detailed description
     * @param reproductionStepsIpfsHash IPFS hash of reproduction steps
     * @param initialBounty Initial bounty amount
     * @param bountyToken Token address (address(0) for native)
     * @param deadline Resolution deadline (0 for no deadline)
     * @return issueId Unique identifier for the issue
     */
    function createIssue(
        bytes32 reporterAgentId,
        bytes32 targetCodeId,
        IssueType issueType,
        IssueSeverity severity,
        string calldata title,
        string calldata descriptionIpfsHash,
        string calldata reproductionStepsIpfsHash,
        uint256 initialBounty,
        address bountyToken,
        uint256 deadline
    ) external payable returns (bytes32 issueId);
    
    /**
     * @notice Add bounty to an existing issue
     * @param issueId Issue identifier
     */
    function addBounty(bytes32 issueId) external payable;
    
    /**
     * @notice Add ERC20 token bounty
     * @param issueId Issue identifier
     * @param token Token address
     * @param amount Amount to add
     */
    function addTokenBounty(
        bytes32 issueId,
        address token,
        uint256 amount
    ) external;
    
    /**
     * @notice Assign issue to an agent
     * @param issueId Issue identifier
     * @param assigneeAgentId Agent to assign
     */
    function assignIssue(bytes32 issueId, bytes32 assigneeAgentId) external;
    
    /**
     * @notice Update issue status
     * @param issueId Issue identifier
     * @param newStatus New status
     */
    function updateStatus(bytes32 issueId, IssueStatus newStatus) external;
    
    /**
     * @notice Submit a solution for an issue
     * @param issueId Issue identifier
     * @param solverAgentId Solving agent
     * @param solutionIpfsHash IPFS hash of solution
     * @param explanationIpfsHash IPFS hash of explanation
     * @param relatedCodeIds Related code fixes submitted
     * @return solutionId Unique solution identifier
     */
    function submitSolution(
        bytes32 issueId,
        bytes32 solverAgentId,
        string calldata solutionIpfsHash,
        string calldata explanationIpfsHash,
        bytes32[] calldata relatedCodeIds
    ) external returns (bytes32 solutionId);
    
    /**
     * @notice Accept a solution and release bounty
     * @param issueId Issue identifier
     * @param solutionId Solution to accept
     */
    function acceptSolution(bytes32 issueId, bytes32 solutionId) external;
    
    /**
     * @notice Add comment to issue
     * @param issueId Issue identifier
     * @param authorAgentId Commenting agent
     * @param commentIpfsHash IPFS hash of comment
     */
    function addComment(
        bytes32 issueId,
        bytes32 authorAgentId,
        string calldata commentIpfsHash
    ) external;
    
    /**
     * @notice Withdraw bounty (only by reporter if issue cancelled)
     * @param issueId Issue identifier
     */
    function withdrawBounty(bytes32 issueId) external;
    
    // ============ View Functions ============
    
    function getIssue(bytes32 issueId) external view returns (IssueView memory);
    function getSolution(bytes32 solutionId) external view returns (Solution memory);
    function getIssuesByReporter(bytes32 reporterAgentId) external view returns (bytes32[] memory);
    function getIssuesByAssignee(bytes32 assigneeAgentId) external view returns (bytes32[] memory);
    function getIssuesByCode(bytes32 codeId) external view returns (bytes32[] memory);
    function getIssuesByStatus(IssueStatus status) external view returns (bytes32[] memory);
    function getOpenBounties() external view returns (bytes32[] memory);
    function getBountyContributions(bytes32 issueId) external view returns (BountyContribution[] memory);
    function getTotalBounty(bytes32 issueId) external view returns (uint256);
    function getSolutionsByIssue(bytes32 issueId) external view returns (bytes32[] memory);
    function getSolutionsBySolver(bytes32 solverAgentId) external view returns (bytes32[] memory);
    function calculateReward(
        bytes32 issueId,
        bytes32 solverAgentId
    ) external view returns (uint256 amount, address token);
}