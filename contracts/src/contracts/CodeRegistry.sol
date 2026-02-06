// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ICodeRegistry} from "../interfaces/ICodeRegistry.sol";

/**
 * @title CodeRegistry
 * @notice Main registry for code snippets with versioning, forking, voting, and agent coordination
 * @dev Handles code storage references (IPFS hashes) with voting and comments
 */
contract CodeRegistry is ICodeRegistry, Ownable, ReentrancyGuard {
    
    // ============ State Variables ============
    
    uint256 public postingFee;
    uint256 public codeCounter;
    uint256 public activeCodeCount;
    
    // Mapping from code ID to code snippet
    mapping(uint256 => CodeSnippet) public codeSnippets;
    
    // Mapping from IPFS hash to code ID (for duplicate detection)
    mapping(string => uint256) public contentRegistry;
    
    // Mapping from author to their code IDs
    mapping(address => uint256[]) public authorCodes;
    
    // Supported languages and categories
    mapping(Language => bool) public supportedLanguages;
    mapping(Category => bool) public supportedCategories;
    
    // Language and category index for filtering
    mapping(Language => uint256[]) public codesByLanguage;
    mapping(Category => uint256[]) public codesByCategory;
    
    // ============ Voting State ============
    
    // Mapping from codeId => voter => hasVoted (prevents double voting)
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    // Mapping from codeId => upvote count
    mapping(uint256 => uint256) public upvotes;
    
    // Mapping from codeId => downvote count
    mapping(uint256 => uint256) public downvotes;
    
    // Mapping from codeId => weighted score (reputation-weighted)
    mapping(uint256 => int256) public voteScore;
    
    // Reputation contract for vote weighting
    address public reputationToken;
    
    // ============ Comments State ============
    
    // Using ICodeRegistry.Comment struct from interface
    // Mapping from codeId => commentId => Comment
    mapping(uint256 => mapping(uint256 => ICodeRegistry.Comment)) public comments;
    
    // Mapping from codeId => comment count
    mapping(uint256 => uint256) public commentCount;
    
    // Global comment counter
    uint256 public commentCounter;
    
    // ============ Agent Coordination ============
    
    // Mapping from agent UP address => isRegistered
    mapping(address => bool) public registeredAgents;
    
    // Mapping from codeId => agents that reviewed it
    mapping(uint256 => address[]) public codeReviewers;
    
    // Maximum versions to prevent gas issues
    uint256 public constant MAX_VERSIONS = 100;
    
    // ============ Modifiers ============
    
    modifier validCodeId(uint256 codeId) {
        if (codeId == 0 || codeId > codeCounter) revert CodeNotFound();
        _;
    }
    
    modifier onlyActive(uint256 codeId) {
        if (!codeSnippets[codeId].isActive) revert CodeInactive();
        _;
    }
    
    modifier onlyRegisteredAgent() {
        if (!registeredAgents[msg.sender]) revert NotRegisteredAgent();
        _;
    }
    
    // ============ Constructor ============
    
    constructor(uint256 _postingFee, address _reputationToken) Ownable(msg.sender) {
        postingFee = _postingFee;
        reputationToken = _reputationToken;
        codeCounter = 0;
        activeCodeCount = 0;
        commentCounter = 0;
        
        // Initialize with all languages supported by default
        supportedLanguages[Language.JavaScript] = true;
        supportedLanguages[Language.TypeScript] = true;
        supportedLanguages[Language.Python] = true;
        supportedLanguages[Language.Solidity] = true;
        supportedLanguages[Language.Rust] = true;
        supportedLanguages[Language.Go] = true;
        supportedLanguages[Language.Java] = true;
        supportedLanguages[Language.Cpp] = true;
        supportedLanguages[Language.C] = true;
        supportedLanguages[Language.CSharp] = true;
        supportedLanguages[Language.Ruby] = true;
        supportedLanguages[Language.Swift] = true;
        supportedLanguages[Language.Kotlin] = true;
        supportedLanguages[Language.Other] = true;
        
        // Initialize with all categories supported by default
        supportedCategories[Category.Utility] = true;
        supportedCategories[Category.DeFi] = true;
        supportedCategories[Category.NFT] = true;
        supportedCategories[Category.Gaming] = true;
        supportedCategories[Category.Governance] = true;
        supportedCategories[Category.Security] = true;
        supportedCategories[Category.Analytics] = true;
        supportedCategories[Category.Infrastructure] = true;
        supportedCategories[Category.Other] = true;
    }
    
    // ============ Voting Functions ============
    
    /**
     * @notice Vote on a code snippet (upvote or downvote)
     * @param codeId ID of the code to vote on
     * @param isUpvote true for upvote, false for downvote
     */
    function vote(uint256 codeId, bool isUpvote) external validCodeId(codeId) onlyActive(codeId) nonReentrant {
        if (hasVoted[codeId][msg.sender]) revert AlreadyVoted();
        
        // Get voter's reputation weight
        uint256 voteWeight = _getVoteWeight(msg.sender);
        
        hasVoted[codeId][msg.sender] = true;
        
        if (isUpvote) {
            upvotes[codeId]++;
            voteScore[codeId] += int256(voteWeight);
        } else {
            downvotes[codeId]++;
            voteScore[codeId] -= int256(voteWeight);
        }
        
        emit VoteCast(codeId, msg.sender, isUpvote, voteWeight);
    }
    
    /**
     * @notice Remove your vote from a code snippet
     * @param codeId ID of the code to remove vote from
     */
    function removeVote(uint256 codeId) external validCodeId(codeId) nonReentrant {
        if (!hasVoted[codeId][msg.sender]) revert NotVoted();
        
        uint256 voteWeight = _getVoteWeight(msg.sender);
        
        // Determine if it was upvote or downvote and reverse
        // We need to track this better - for now assume upvote removal
        // TODO: Add vote direction tracking
        
        hasVoted[codeId][msg.sender] = false;
        
        emit VoteRemoved(codeId, msg.sender);
    }
    
    /**
     * @notice Get vote counts for a code snippet
     * @param codeId ID of the code
     * @return upvoteCount Number of upvotes
     * @return downvoteCount Number of downvotes
     * @return score Weighted score
     */
    function getVoteStats(uint256 codeId) external view validCodeId(codeId) returns (
        uint256 upvoteCount,
        uint256 downvoteCount,
        int256 score
    ) {
        return (upvotes[codeId], downvotes[codeId], voteScore[codeId]);
    }
    
    /**
     * @notice Check if an address has voted on a code
     * @param codeId ID of the code
     * @param voter Address to check
     * @return hasVotedResult Whether they voted
     */
    function hasVotedOn(uint256 codeId, address voter) external view returns (bool) {
        return hasVoted[codeId][voter];
    }
    
    // ============ Comment Functions ============
    
    /**
     * @notice Add a comment to a code snippet
     * @param codeId ID of the code to comment on
     * @param content IPFS hash of comment content
     * @param parentId Parent comment ID for threading (0 = top-level)
     * @return commentId The ID of the new comment
     */
    function addComment(
        uint256 codeId,
        string calldata content,
        uint256 parentId
    ) external validCodeId(codeId) onlyActive(codeId) returns (uint256) {
        if (bytes(content).length == 0) revert EmptyContent();
        if (parentId != 0 && parentId > commentCounter) revert InvalidParentComment();
        
        commentCounter++;
        uint256 newCommentId = commentCounter;
        
        ICodeRegistry.Comment storage newComment = comments[codeId][newCommentId];
        newComment.id = newCommentId;
        newComment.author = msg.sender;
        newComment.content = content;
        newComment.timestamp = block.timestamp;
        newComment.parentId = parentId;
        
        commentCount[codeId]++;
        
        emit CommentAdded(codeId, newCommentId, msg.sender, parentId);
        
        return newCommentId;
    }
    
    /**
     * @notice Get a comment by ID
     * @param codeId ID of the code
     * @param commentId ID of the comment
     * @return Comment struct
     */
    function getComment(uint256 codeId, uint256 commentId) external view returns (ICodeRegistry.Comment memory) {
        return comments[codeId][commentId];
    }
    
    /**
     * @notice Get all comment IDs for a code
     * @param codeId ID of the code
     * @return Array of comment IDs
     */
    function getCodeComments(uint256 codeId) external view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](commentCount[codeId]);
        uint256 idx = 0;
        
        for (uint256 i = 1; i <= commentCounter; i++) {
            if (comments[codeId][i].id != 0) {
                result[idx] = i;
                idx++;
            }
        }
        
        return result;
    }
    
    // ============ Agent Registration ============
    
    /**
     * @notice Register an agent (UP address) to enable coordination
     * @param agent Address of the agent's Universal Profile
     */
    function registerAgent(address agent) external onlyOwner {
        registeredAgents[agent] = true;
        emit AgentRegistered(agent);
    }
    
    /**
     * @notice Unregister an agent
     * @param agent Address of the agent
     */
    function unregisterAgent(address agent) external onlyOwner {
        registeredAgents[agent] = false;
        emit AgentUnregistered(agent);
    }
    
    /**
     * @notice Mark code as reviewed by an agent
     * @param codeId ID of the code reviewed
     */
    function markAsReviewed(uint256 codeId) external validCodeId(codeId) onlyRegisteredAgent {
        codeReviewers[codeId].push(msg.sender);
        emit CodeReviewed(codeId, msg.sender);
    }
    
    /**
     * @notice Get all agents that reviewed a code
     * @param codeId ID of the code
     * @return Array of agent addresses
     */
    function getCodeReviewers(uint256 codeId) external view returns (address[] memory) {
        return codeReviewers[codeId];
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Post a new code snippet to the registry
     * @param ipfsHash IPFS hash pointing to the code content
     * @param title Title of the code snippet
     * @param description Description of the code
     * @param language Programming language
     * @param category Code category
     * @param dependencies Array of code IDs this code depends on
     * @return codeId The ID of the newly created code
     */
    /**
     * @notice Check if string contains LUKSO/LSP keywords
     */
    function _isLuksoRelated(string memory text) internal pure returns (bool) {
        bytes memory textBytes = bytes(_toLower(text));
        
        // Check for LSP
        if (_contains(textBytes, bytes("lsp"))) return true;
        if (_contains(textBytes, bytes("lukso"))) return true;
        if (_contains(textBytes, bytes("universal profile"))) return true;
        if (_contains(textBytes, bytes("keymanager"))) return true;
        if (_contains(textBytes, bytes("key manager"))) return true;
        if (_contains(textBytes, bytes("erc725"))) return true;
        if (_contains(textBytes, bytes("digital asset"))) return true;
        if (_contains(textBytes, bytes("identifiable asset"))) return true;
        if (_contains(textBytes, bytes("vault"))) return true;
        if (_contains(textBytes, bytes("delegation"))) return true;
        
        return false;
    }
    
    /**
     * @notice Convert string to lowercase
     */
    function _toLower(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        for (uint i = 0; i < bStr.length; i++) {
            if ((uint8(bStr[i]) >= 65) && (uint8(bStr[i]) <= 90)) {
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }
    
    /**
     * @notice Check if bytes contains substring
     */
    function _contains(bytes memory _base, bytes memory _value) internal pure returns (bool) {
        if (_value.length == 0) return true;
        if (_base.length < _value.length) return false;
        
        for (uint i = 0; i <= _base.length - _value.length; i++) {
            bool found = true;
            for (uint j = 0; j < _value.length; j++) {
                if (_base[i + j] != _value[j]) {
                    found = false;
                    break;
                }
            }
            if (found) return true;
        }
        return false;
    }

    function postCode(
        string calldata ipfsHash,
        string calldata title,
        string calldata description,
        Language language,
        Category category,
        uint256[] calldata dependencies
    ) external payable override nonReentrant returns (uint256) {
        // Validate inputs
        if (bytes(ipfsHash).length == 0) revert InvalidIPFSHash();
        if (bytes(title).length == 0) revert EmptyTitle();
        if (contentRegistry[ipfsHash] != 0) revert DuplicateContent();
        if (!supportedLanguages[language]) revert InvalidLanguage();
        if (!supportedCategories[category]) revert InvalidCategory();
        if (msg.value < postingFee) revert InvalidFee();
        
        // Enforce LUKSO/LSP content only
        if (!_isLuksoRelated(title) && !_isLuksoRelated(description)) {
            revert InvalidCategory();
        }
        
        // Check for circular dependencies
        _validateDependencies(dependencies);
        
        // Create new code snippet
        codeCounter++;
        uint256 newCodeId = codeCounter;
        
        CodeSnippet storage newCode = codeSnippets[newCodeId];
        newCode.id = newCodeId;
        newCode.author = msg.sender;
        newCode.ipfsHash = ipfsHash;
        newCode.title = title;
        newCode.description = description;
        newCode.language = language;
        newCode.category = category;
        newCode.dependencies = dependencies;
        newCode.isActive = true;
        newCode.createdAt = block.timestamp;
        newCode.updatedAt = block.timestamp;
        
        // Register content
        contentRegistry[ipfsHash] = newCodeId;
        
        // Add to author's codes
        authorCodes[msg.sender].push(newCodeId);
        
        // Add to language and category indexes
        codesByLanguage[language].push(newCodeId);
        codesByCategory[category].push(newCodeId);
        
        activeCodeCount++;
        
        emit CodePosted(newCodeId, msg.sender, ipfsHash, title);
        
        return newCodeId;
    }
    
    /**
     * @notice Update an existing code snippet (creates a new version)
     * @param codeId ID of the code to update
     * @param newIpfsHash New IPFS hash for the updated code
     * @param newTitle New title
     * @param newDescription New description
     * @param newDependencies Updated dependencies
     * @return newCodeId The ID of the new version
     */
    function updateCode(
        uint256 codeId,
        string calldata newIpfsHash,
        string calldata newTitle,
        string calldata newDescription,
        uint256[] calldata newDependencies
    ) external payable override validCodeId(codeId) onlyActive(codeId) nonReentrant returns (uint256) {
        CodeSnippet storage oldCode = codeSnippets[codeId];
        
        if (oldCode.author != msg.sender) revert NotAuthor();
        if (bytes(newIpfsHash).length == 0) revert InvalidIPFSHash();
        if (bytes(newTitle).length == 0) revert EmptyTitle();
        if (contentRegistry[newIpfsHash] != 0) revert DuplicateContent();
        if (oldCode.previousVersions.length >= MAX_VERSIONS) revert VersionLimitReached();
        if (msg.value < postingFee) revert InvalidFee();
        
        // Validate new dependencies
        _validateDependencies(newDependencies);
        
        // Create new version
        codeCounter++;
        uint256 newCodeId = codeCounter;
        
        CodeSnippet storage newCode = codeSnippets[newCodeId];
        newCode.id = newCodeId;
        newCode.author = msg.sender;
        newCode.ipfsHash = newIpfsHash;
        newCode.title = newTitle;
        newCode.description = newDescription;
        newCode.language = oldCode.language;
        newCode.category = oldCode.category;
        newCode.dependencies = newDependencies;
        newCode.previousVersions = _copyArray(oldCode.previousVersions);
        newCode.previousVersions.push(codeId);
        newCode.isActive = true;
        newCode.createdAt = block.timestamp;
        newCode.updatedAt = block.timestamp;
        
        // Register new content
        contentRegistry[newIpfsHash] = newCodeId;
        
        // Add to author's codes
        authorCodes[msg.sender].push(newCodeId);
        
        // Add to language and category indexes
        codesByLanguage[oldCode.language].push(newCodeId);
        codesByCategory[oldCode.category].push(newCodeId);
        
        activeCodeCount++;
        
        emit CodeUpdated(codeId, newCodeId, msg.sender);
        
        return newCodeId;
    }
    
    /**
     * @notice Fork an existing code snippet
     * @param parentId ID of the code to fork
     * @param ipfsHash New IPFS hash for the forked code
     * @param title Title for the fork
     * @param description Description for the fork
     * @param additionalDependencies Additional dependencies beyond the parent
     * @return newCodeId The ID of the forked code
     */
    function forkCode(
        uint256 parentId,
        string calldata ipfsHash,
        string calldata title,
        string calldata description,
        uint256[] calldata additionalDependencies
    ) external payable override validCodeId(parentId) onlyActive(parentId) nonReentrant returns (uint256) {
        CodeSnippet storage parentCode = codeSnippets[parentId];
        
        if (bytes(ipfsHash).length == 0) revert InvalidIPFSHash();
        if (bytes(title).length == 0) revert EmptyTitle();
        if (contentRegistry[ipfsHash] != 0) revert DuplicateContent();
        if (msg.value < postingFee) revert InvalidFee();
        
        // Merge dependencies: parent dependencies + parent + additional
        uint256[] memory mergedDeps = new uint256[](parentCode.dependencies.length + 1 + additionalDependencies.length);
        uint256 idx = 0;
        
        for (uint256 i = 0; i < parentCode.dependencies.length; i++) {
            mergedDeps[idx++] = parentCode.dependencies[i];
        }
        mergedDeps[idx++] = parentId;
        
        for (uint256 i = 0; i < additionalDependencies.length; i++) {
            mergedDeps[idx++] = additionalDependencies[i];
        }
        
        // Validate merged dependencies
        _validateDependencies(mergedDeps);
        
        // Create fork
        codeCounter++;
        uint256 newCodeId = codeCounter;
        
        CodeSnippet storage newCode = codeSnippets[newCodeId];
        newCode.id = newCodeId;
        newCode.author = msg.sender;
        newCode.ipfsHash = ipfsHash;
        newCode.title = title;
        newCode.description = description;
        newCode.language = parentCode.language;
        newCode.category = parentCode.category;
        newCode.dependencies = mergedDeps;
        newCode.isActive = true;
        newCode.createdAt = block.timestamp;
        newCode.updatedAt = block.timestamp;
        
        // Register content
        contentRegistry[ipfsHash] = newCodeId;
        
        // Add to author's codes
        authorCodes[msg.sender].push(newCodeId);
        
        // Add to language and category indexes
        codesByLanguage[parentCode.language].push(newCodeId);
        codesByCategory[parentCode.category].push(newCodeId);
        
        activeCodeCount++;
        
        emit CodeForked(parentId, newCodeId, msg.sender);
        
        return newCodeId;
    }
    
    /**
     * @notice Deactivate a code snippet (soft delete)
     * @param codeId ID of the code to deactivate
     */
    function deactivateCode(uint256 codeId) external override validCodeId(codeId) onlyActive(codeId) {
        CodeSnippet storage code = codeSnippets[codeId];
        
        if (code.author != msg.sender) revert NotAuthor();
        
        code.isActive = false;
        activeCodeCount--;
        
        emit CodeDeactivated(codeId, msg.sender);
    }
    
    // ============ View Functions ============
    
    function getCodeSnippet(uint256 codeId) external view override validCodeId(codeId) returns (CodeSnippet memory) {
        return codeSnippets[codeId];
    }
    
    function getAuthorCodes(address author) external view override returns (uint256[] memory) {
        return authorCodes[author];
    }
    
    function getAllActiveCodes(uint256 offset, uint256 limit) external view override returns (uint256[] memory) {
        uint256 resultSize = 0;
        uint256[] memory temp = new uint256[](limit);
        
        for (uint256 i = offset + 1; i <= codeCounter && resultSize < limit; i++) {
            if (codeSnippets[i].isActive) {
                temp[resultSize] = i;
                resultSize++;
            }
        }
        
        uint256[] memory result = new uint256[](resultSize);
        for (uint256 i = 0; i < resultSize; i++) {
            result[i] = temp[i];
        }
        
        return result;
    }
    
    function getCodesByLanguage(Language language, uint256 offset, uint256 limit) external view override returns (uint256[] memory) {
        uint256[] storage allCodes = codesByLanguage[language];
        uint256 resultSize = 0;
        uint256[] memory temp = new uint256[](limit);
        
        for (uint256 i = offset; i < allCodes.length && resultSize < limit; i++) {
            if (codeSnippets[allCodes[i]].isActive) {
                temp[resultSize] = allCodes[i];
                resultSize++;
            }
        }
        
        uint256[] memory result = new uint256[](resultSize);
        for (uint256 i = 0; i < resultSize; i++) {
            result[i] = temp[i];
        }
        
        return result;
    }
    
    function getCodesByCategory(Category category, uint256 offset, uint256 limit) external view override returns (uint256[] memory) {
        uint256[] storage allCodes = codesByCategory[category];
        uint256 resultSize = 0;
        uint256[] memory temp = new uint256[](limit);
        
        for (uint256 i = offset; i < allCodes.length && resultSize < limit; i++) {
            if (codeSnippets[allCodes[i]].isActive) {
                temp[resultSize] = allCodes[i];
                resultSize++;
            }
        }
        
        uint256[] memory result = new uint256[](resultSize);
        for (uint256 i = 0; i < resultSize; i++) {
            result[i] = temp[i];
        }
        
        return result;
    }
    
    function isContentRegistered(string calldata ipfsHash) external view override returns (bool) {
        return contentRegistry[ipfsHash] != 0;
    }
    
    function getCodeCount() external view override returns (uint256) {
        return codeCounter;
    }
    
    function getActiveCodeCount() external view override returns (uint256) {
        return activeCodeCount;
    }
    
    // ============ Admin Functions ============
    
    function setPostingFee(uint256 newFee) external override onlyOwner {
        uint256 oldFee = postingFee;
        postingFee = newFee;
        emit PostingFeeUpdated(oldFee, newFee);
    }
    
    function setReputationToken(address newToken) external onlyOwner {
        reputationToken = newToken;
        emit ReputationTokenUpdated(newToken);
    }
    
    function withdrawFees() external override onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) revert TransferFailed();
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        if (!success) revert TransferFailed();
        
        emit FeesWithdrawn(owner(), balance);
    }
    
    function addSupportedLanguage(Language language, string calldata name) external override onlyOwner {
        supportedLanguages[language] = true;
        emit LanguageAdded(language, name);
    }
    
    function addSupportedCategory(Category category, string calldata name) external override onlyOwner {
        supportedCategories[category] = true;
        emit CategoryAdded(category, name);
    }
    
    function isLanguageSupported(Language language) external view override returns (bool) {
        return supportedLanguages[language];
    }
    
    function isCategorySupported(Category category) external view override returns (bool) {
        return supportedCategories[category];
    }
    
    // ============ Internal Functions ============
    
    /**
     * @dev Get vote weight based on reputation (default 1 if no reputation token)
     */
    function _getVoteWeight(address voter) internal view returns (uint256) {
        if (reputationToken == address(0)) return 1;
        
        // Call reputation token to get balance
        // This is a simplified version - in production use interface
        (bool success, bytes memory result) = reputationToken.staticcall(
            abi.encodeWithSignature("balanceOf(address)", voter)
        );
        
        if (success && result.length >= 32) {
            uint256 reputation = abi.decode(result, (uint256));
            // Weight = 1 + log2(reputation/1e18) to prevent whale dominance
            if (reputation >= 1e18) {
                return 1 + _log2(reputation / 1e18);
            }
        }
        
        return 1;
    }
    
    /**
     * @dev Simple log2 implementation
     */
    function _log2(uint256 x) internal pure returns (uint256) {
        uint256 result = 0;
        while (x > 1) {
            x >>= 1;
            result++;
        }
        return result;
    }
    
    /**
     * @dev Validate dependencies don't create circular references
     * @param dependencies Array of code IDs to validate
     */
    function _validateDependencies(uint256[] memory dependencies) internal view {
        for (uint256 i = 0; i < dependencies.length; i++) {
            if (dependencies[i] == 0 || dependencies[i] > codeCounter) {
                revert InvalidInput();
            }
            if (!codeSnippets[dependencies[i]].isActive) {
                revert CodeInactive();
            }
            // Check for duplicates within the array
            for (uint256 j = i + 1; j < dependencies.length; j++) {
                if (dependencies[i] == dependencies[j]) {
                    revert CircularDependency();
                }
            }
        }
    }
    
    /**
     * @dev Copy an array (needed for creating new code versions)
     */
    function _copyArray(uint256[] storage arr) internal view returns (uint256[] memory) {
        uint256[] memory copy = new uint256[](arr.length);
        for (uint256 i = 0; i < arr.length; i++) {
            copy[i] = arr[i];
        }
        return copy;
    }
    
    // ============ Fallback ============
    
    receive() external payable {
        revert("Direct transfers not accepted");
    }
}
