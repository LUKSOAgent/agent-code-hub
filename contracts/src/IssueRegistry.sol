// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IIssueRegistry.sol";
import "./interfaces/IAgentRegistry.sol";
import "./utils/AccessControl.sol";
import "./utils/ReentrancyGuard.sol";
import "./utils/IdGenerator.sol";
import "./utils/StringUtils.sol";

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title IssueRegistry
 * @notice Bug bounty and issue tracking system
 */
contract IssueRegistry is IIssueRegistry, AccessControl, ReentrancyGuard {
    using StringUtils for string;
    
    // ============ Storage ============
    
    mapping(bytes32 => Issue) private _issues;
    mapping(bytes32 => Solution) private _solutions;
    mapping(bytes32 => bytes32[]) private _issuesByReporter;
    mapping(bytes32 => bytes32[]) private _issuesByAssignee;
    mapping(bytes32 => bytes32[]) private _issuesByCode;
    mapping(IssueStatus => bytes32[]) private _issuesByStatus;
    mapping(bytes32 => bytes32[]) private _solutionsBySolver;
    
    bytes32[] private _allIssues;
    bytes32[] private _openBounties;
    
    IAgentRegistry public agentRegistry;
    
    uint256 private _issueCounter;
    uint256 private _solutionCounter;
    
    // ============ Modifiers ============
    
    modifier issueExists(bytes32 issueId) {
        require(_issues[issueId].id != bytes32(0), "IssueRegistry: issue not found");
        _;
    }
    
    modifier solutionExists(bytes32 solutionId) {
        require(_solutions[solutionId].id != bytes32(0), "IssueRegistry: solution not found");
        _;
    }
    
    modifier validAgent(bytes32 agentId) {
        require(agentRegistry.isRegistered(agentId), "IssueRegistry: agent not registered");
        _;
    }
    
    modifier onlyReporter(bytes32 issueId) {
        require(_isReporter(issueId, msg.sender) || isAdmin(msg.sender), "IssueRegistry: not reporter");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _agentRegistry) {
        require(_agentRegistry != address(0), "IssueRegistry: invalid agent registry");
        agentRegistry = IAgentRegistry(_agentRegistry);
    }
    
    // ============ Internal Functions ============
    
    function _isReporter(bytes32 issueId, address sender) internal view returns (bool) {
        bytes32 reporterId = _issues[issueId].reporterAgentId;
        IAgentRegistry.AgentView memory agent = agentRegistry.getAgent(reporterId);
        return agent.universalProfile == sender;
    }
    
    function _createIssueId(bytes32 reporterAgentId) internal returns (bytes32) {
        _issueCounter++;
        return IdGenerator.generateIssueId(reporterAgentId, block.timestamp, _issueCounter);
    }
    
    function _createSolutionId(bytes32 issueId, bytes32 solverAgentId) internal returns (bytes32) {
        _solutionCounter++;
        return IdGenerator.generateSolutionId(issueId, solverAgentId, block.timestamp);
    }
    
    function _removeFromOpenBounties(bytes32 issueId) internal {
        for (uint256 i = 0; i < _openBounties.length; i++) {
            if (_openBounties[i] == issueId) {
                _openBounties[i] = _openBounties[_openBounties.length - 1];
                _openBounties.pop();
                break;
            }
        }
    }
    
    // ============ External Functions ============
    
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
    ) external payable override nonReentrant validAgent(reporterAgentId) returns (bytes32 issueId) {
        require(!title.isEmpty(), "IssueRegistry: title required");
        
        issueId = _createIssueId(reporterAgentId);
        
        Issue storage issue = _issues[issueId];
        issue.id = issueId;
        issue.reporterAgentId = reporterAgentId;
        issue.targetCodeId = targetCodeId;
        issue.issueType = issueType;
        issue.severity = severity;
        issue.status = IssueStatus.Open;
        issue.title = title;
        issue.descriptionIpfsHash = descriptionIpfsHash;
        issue.reproductionStepsIpfsHash = reproductionStepsIpfsHash;
        issue.createdAt = block.timestamp;
        issue.updatedAt = block.timestamp;
        issue.deadline = deadline;
        
        // Handle bounty
        if (bountyToken == address(0)) {
            require(msg.value == initialBounty, "IssueRegistry: invalid native bounty");
            issue.bounty = msg.value;
        } else {
            require(msg.value == 0, "IssueRegistry: cannot send native with token bounty");
            issue.bountyToken = bountyToken;
            issue.bounty = initialBounty;
            if (initialBounty > 0) {
                IERC20(bountyToken).transferFrom(msg.sender, address(this), initialBounty);
            }
        }
        
        if (issue.bounty > 0) {
            issue.bountyContributors.push(msg.sender);
            issue.bountyContributions[msg.sender] = issue.bounty;
            _openBounties.push(issueId);
        }
        
        _allIssues.push(issueId);
        _issuesByReporter[reporterAgentId].push(issueId);
        if (targetCodeId != bytes32(0)) {
            _issuesByCode[targetCodeId].push(issueId);
        }
        _issuesByStatus[IssueStatus.Open].push(issueId);
        
        // Update agent reputation
        agentRegistry.updateReputation(reporterAgentId, 5, "Issue reported");
        
        emit IssueCreated(issueId, reporterAgentId, targetCodeId, severity, title, issue.bounty, block.timestamp);
    }
    
    function addBounty(bytes32 issueId) external payable override issueExists(issueId) nonReentrant {
        Issue storage issue = _issues[issueId];
        require(issue.bountyToken == address(0), "IssueRegistry: use addTokenBounty for ERC20");
        require(msg.value > 0, "IssueRegistry: no value sent");
        require(issue.status == IssueStatus.Open || issue.status == IssueStatus.Acknowledged, "IssueRegistry: issue not open");
        
        issue.bounty += msg.value;
        
        if (issue.bountyContributions[msg.sender] == 0) {
            issue.bountyContributors.push(msg.sender);
        }
        issue.bountyContributions[msg.sender] += msg.value;
        
        emit BountyAdded(issueId, msg.sender, msg.value, issue.bounty);
    }
    
    function addTokenBounty(
        bytes32 issueId,
        address token,
        uint256 amount
    ) external override issueExists(issueId) nonReentrant {
        Issue storage issue = _issues[issueId];
        require(token == issue.bountyToken, "IssueRegistry: wrong token");
        require(amount > 0, "IssueRegistry: no amount");
        require(issue.status == IssueStatus.Open || issue.status == IssueStatus.Acknowledged, "IssueRegistry: issue not open");
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        issue.bounty += amount;
        
        if (issue.bountyContributions[msg.sender] == 0) {
            issue.bountyContributors.push(msg.sender);
        }
        issue.bountyContributions[msg.sender] += amount;
        
        emit BountyAdded(issueId, msg.sender, amount, issue.bounty);
    }
    
    function assignIssue(bytes32 issueId, bytes32 assigneeAgentId) external override issueExists(issueId) validAgent(assigneeAgentId) {
        Issue storage issue = _issues[issueId];
        issue.assigneeAgentId = assigneeAgentId;
        issue.updatedAt = block.timestamp;
        
        _issuesByAssignee[assigneeAgentId].push(issueId);
        
        emit IssueAssigned(issueId, assigneeAgentId, block.timestamp);
    }
    
    function updateStatus(bytes32 issueId, IssueStatus newStatus) external override issueExists(issueId) {
        Issue storage issue = _issues[issueId];
        IssueStatus oldStatus = issue.status;
        
        // Authorization checks
        if (newStatus == IssueStatus.Closed || newStatus == IssueStatus.Disputed) {
            require(_isReporter(issueId, msg.sender) || isAdmin(msg.sender), "IssueRegistry: not authorized");
        } else {
            require(
                _isReporter(issueId, msg.sender) || 
                issue.assigneeAgentId == _getAgentIdFromSender() || 
                isAdmin(msg.sender),
                "IssueRegistry: not authorized"
            );
        }
        
        issue.status = newStatus;
        issue.updatedAt = block.timestamp;
        
        // Update status tracking arrays
        // (Simplified - in production, remove from old status array)
        _issuesByStatus[newStatus].push(issueId);
        
        if (newStatus == IssueStatus.Resolved || newStatus == IssueStatus.Closed) {
            _removeFromOpenBounties(issueId);
        }
        
        emit IssueStatusChanged(issueId, oldStatus, newStatus, block.timestamp);
    }
    
    function _getAgentIdFromSender() internal view returns (bytes32) {
        // This would need to look up agent by UP in a real implementation
        return bytes32(0);
    }
    
    function submitSolution(
        bytes32 issueId,
        bytes32 solverAgentId,
        string calldata solutionIpfsHash,
        string calldata explanationIpfsHash,
        bytes32[] calldata relatedCodeIds
    ) external override issueExists(issueId) validAgent(solverAgentId) returns (bytes32 solutionId) {
        Issue storage issue = _issues[issueId];
        require(issue.status == IssueStatus.Open || issue.status == IssueStatus.InProgress, "IssueRegistry: issue not open");
        
        solutionId = _createSolutionId(issueId, solverAgentId);
        
        Solution storage solution = _solutions[solutionId];
        solution.id = solutionId;
        solution.issueId = issueId;
        solution.solverAgentId = solverAgentId;
        solution.solutionIpfsHash = solutionIpfsHash;
        solution.explanationIpfsHash = explanationIpfsHash;
        solution.submittedAt = block.timestamp;
        solution.relatedCodeIds = relatedCodeIds;
        
        issue.solutionIds.push(solutionId);
        _solutionsBySolver[solverAgentId].push(solutionId);
        
        // Update status
        if (issue.status == IssueStatus.Open) {
            issue.status = IssueStatus.UnderReview;
        }
        issue.updatedAt = block.timestamp;
        
        // Update agent reputation
        agentRegistry.updateReputation(solverAgentId, 3, "Solution submitted");
        
        emit SolutionSubmitted(issueId, solutionId, solverAgentId, solutionIpfsHash, block.timestamp);
    }
    
    function acceptSolution(bytes32 issueId, bytes32 solutionId) external override issueExists(issueId) solutionExists(solutionId) nonReentrant onlyReporter(issueId) {
        Issue storage issue = _issues[issueId];
        Solution storage solution = _solutions[solutionId];
        
        require(solution.issueId == issueId, "IssueRegistry: solution not for this issue");
        require(!solution.isAccepted, "IssueRegistry: solution already accepted");
        require(issue.status != IssueStatus.Resolved && issue.status != IssueStatus.Closed, "IssueRegistry: issue already resolved");
        
        solution.isAccepted = true;
        solution.bountyAwarded = issue.bounty;
        issue.acceptedSolutionId = solutionId;
        issue.status = IssueStatus.Resolved;
        issue.resolvedAt = block.timestamp;
        issue.updatedAt = block.timestamp;
        
        // Transfer bounty
        if (issue.bounty > 0) {
            IAgentRegistry.AgentView memory solver = agentRegistry.getAgent(solution.solverAgentId);
            
            if (issue.bountyToken == address(0)) {
                (bool success, ) = payable(solver.universalProfile).call{value: issue.bounty}("");
                require(success, "IssueRegistry: native transfer failed");
            } else {
                IERC20(issue.bountyToken).transfer(solver.universalProfile, issue.bounty);
            }
            
            emit BountyReleased(issueId, solution.solverAgentId, issue.bounty, block.timestamp);
        }
        
        _removeFromOpenBounties(issueId);
        
        // Update agent reputations
        agentRegistry.updateReputation(solution.solverAgentId, 20, "Solution accepted");
        agentRegistry.updateReputation(issue.reporterAgentId, 5, "Issue resolved");
        
        emit SolutionAccepted(issueId, solutionId, issue.bounty, block.timestamp);
    }
    
    function addComment(
        bytes32 issueId,
        bytes32 authorAgentId,
        string calldata commentIpfsHash
    ) external override issueExists(issueId) validAgent(authorAgentId) {
        _issues[issueId].commentIpfsHashes.push(commentIpfsHash);
        _issues[issueId].updatedAt = block.timestamp;
        
        emit CommentAdded(issueId, authorAgentId, commentIpfsHash, block.timestamp);
    }
    
    function withdrawBounty(bytes32 issueId) external override issueExists(issueId) onlyReporter(issueId) nonReentrant {
        Issue storage issue = _issues[issueId];
        require(issue.status == IssueStatus.Closed || issue.status == IssueStatus.Disputed, "IssueRegistry: issue not closed");
        require(issue.acceptedSolutionId == bytes32(0), "IssueRegistry: bounty already awarded");
        require(issue.bounty > 0, "IssueRegistry: no bounty to withdraw");
        
        uint256 amount = issue.bounty;
        issue.bounty = 0;
        
        IAgentRegistry.AgentView memory reporter = agentRegistry.getAgent(issue.reporterAgentId);
        
        if (issue.bountyToken == address(0)) {
            (bool success, ) = payable(reporter.universalProfile).call{value: amount}("");
            require(success, "IssueRegistry: native transfer failed");
        } else {
            IERC20(issue.bountyToken).transfer(reporter.universalProfile, amount);
        }
    }
    
    // ============ View Functions ============
    
    function getIssue(bytes32 issueId) external view override issueExists(issueId) returns (IssueView memory) {
        Issue storage issue = _issues[issueId];
        return IssueView({
            id: issue.id,
            reporterAgentId: issue.reporterAgentId,
            targetCodeId: issue.targetCodeId,
            issueType: issue.issueType,
            severity: issue.severity,
            status: issue.status,
            title: issue.title,
            descriptionIpfsHash: issue.descriptionIpfsHash,
            reproductionStepsIpfsHash: issue.reproductionStepsIpfsHash,
            bounty: issue.bounty,
            bountyToken: issue.bountyToken,
            assigneeAgentId: issue.assigneeAgentId,
            createdAt: issue.createdAt,
            updatedAt: issue.updatedAt,
            deadline: issue.deadline,
            resolvedAt: issue.resolvedAt,
            acceptedSolutionId: issue.acceptedSolutionId,
            solutionIds: issue.solutionIds,
            commentIpfsHashes: issue.commentIpfsHashes
        });
    }
    
    function getSolution(bytes32 solutionId) external view override solutionExists(solutionId) returns (Solution memory) {
        return _solutions[solutionId];
    }
    
    function getIssuesByReporter(bytes32 reporterAgentId) external view override returns (bytes32[] memory) {
        return _issuesByReporter[reporterAgentId];
    }
    
    function getIssuesByAssignee(bytes32 assigneeAgentId) external view override returns (bytes32[] memory) {
        return _issuesByAssignee[assigneeAgentId];
    }
    
    function getIssuesByCode(bytes32 codeId) external view override returns (bytes32[] memory) {
        return _issuesByCode[codeId];
    }
    
    function getIssuesByStatus(IssueStatus status) external view override returns (bytes32[] memory) {
        return _issuesByStatus[status];
    }
    
    function getOpenBounties() external view override returns (bytes32[] memory) {
        return _openBounties;
    }
    
    function getBountyContributions(bytes32 issueId) external view override issueExists(issueId) returns (BountyContribution[] memory) {
        Issue storage issue = _issues[issueId];
        BountyContribution[] memory contributions = new BountyContribution[](issue.bountyContributors.length);
        
        for (uint256 i = 0; i < issue.bountyContributors.length; i++) {
            address contributor = issue.bountyContributors[i];
            contributions[i] = BountyContribution({
                contributor: contributor,
                amount: issue.bountyContributions[contributor],
                contributedAt: 0 // Simplified - would track actual time in production
            });
        }
        
        return contributions;
    }
    
    function getTotalBounty(bytes32 issueId) external view override issueExists(issueId) returns (uint256) {
        return _issues[issueId].bounty;
    }
    
    function getSolutionsByIssue(bytes32 issueId) external view override issueExists(issueId) returns (bytes32[] memory) {
        return _issues[issueId].solutionIds;
    }
    
    function getSolutionsBySolver(bytes32 solverAgentId) external view override returns (bytes32[] memory) {
        return _solutionsBySolver[solverAgentId];
    }
    
    function calculateReward(
        bytes32 issueId,
        bytes32 solverAgentId
    ) external view override issueExists(issueId) returns (uint256 amount, address token) {
        Issue storage issue = _issues[issueId];
        return (issue.bounty, issue.bountyToken);
    }
}