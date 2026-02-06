// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ICodeRegistry
 * @notice Interface for the CodeRegistry contract that manages code snippets with voting and coordination
 */
interface ICodeRegistry {
    // Enums
    enum Language { 
        JavaScript, TypeScript, Python, Solidity, Rust, Go, 
        Java, Cpp, C, CSharp, Ruby, Swift, Kotlin, Other 
    }
    
    enum Category { 
        Utility, DeFi, NFT, Gaming, Governance, 
        Security, Analytics, Infrastructure, Other 
    }

    // Structs
    struct CodeSnippet {
        uint256 id;
        address author;
        string ipfsHash;
        string title;
        string description;
        Language language;
        Category category;
        uint256[] dependencies;
        uint256[] previousVersions;
        bool isActive;
        uint256 createdAt;
        uint256 updatedAt;
    }

    struct Comment {
        uint256 id;
        address author;
        string content;
        uint256 timestamp;
        uint256 parentId;
    }

    // Events
    event CodePosted(uint256 indexed id, address indexed author, string ipfsHash, string title);
    event CodeUpdated(uint256 indexed id, uint256 indexed newId, address indexed author);
    event CodeForked(uint256 indexed parentId, uint256 indexed childId, address indexed forker);
    event CodeDeactivated(uint256 indexed id, address indexed author);
    event LanguageAdded(Language language, string name);
    event CategoryAdded(Category category, string name);
    event PostingFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeesWithdrawn(address indexed owner, uint256 amount);
    event ReputationTokenUpdated(address newToken);
    
    // Voting events
    event VoteCast(uint256 indexed codeId, address indexed voter, bool isUpvote, uint256 weight);
    event VoteRemoved(uint256 indexed codeId, address indexed voter);
    
    // Comment events
    event CommentAdded(uint256 indexed codeId, uint256 indexed commentId, address indexed author, uint256 parentId);
    
    // Agent coordination events
    event AgentRegistered(address indexed agent);
    event AgentUnregistered(address indexed agent);
    event CodeReviewed(uint256 indexed codeId, address indexed agent);

    // Core functions
    function postCode(
        string calldata ipfsHash,
        string calldata title,
        string calldata description,
        Language language,
        Category category,
        uint256[] calldata dependencies
    ) external payable returns (uint256);

    function updateCode(
        uint256 codeId,
        string calldata newIpfsHash,
        string calldata newTitle,
        string calldata newDescription,
        uint256[] calldata newDependencies
    ) external payable returns (uint256);

    function forkCode(
        uint256 parentId,
        string calldata ipfsHash,
        string calldata title,
        string calldata description,
        uint256[] calldata additionalDependencies
    ) external payable returns (uint256);

    function deactivateCode(uint256 codeId) external;

    // Voting functions
    function vote(uint256 codeId, bool isUpvote) external;
    function removeVote(uint256 codeId) external;
    function getVoteStats(uint256 codeId) external view returns (uint256 upvoteCount, uint256 downvoteCount, int256 score);
    function hasVotedOn(uint256 codeId, address voter) external view returns (bool);

    // Comment functions
    function addComment(uint256 codeId, string calldata content, uint256 parentId) external returns (uint256);
    function getComment(uint256 codeId, uint256 commentId) external view returns (Comment memory);
    function getCodeComments(uint256 codeId) external view returns (uint256[] memory);

    // Agent coordination functions
    function registerAgent(address agent) external;
    function unregisterAgent(address agent) external;
    function markAsReviewed(uint256 codeId) external;
    function getCodeReviewers(uint256 codeId) external view returns (address[] memory);

    // View functions
    function getCodeSnippet(uint256 codeId) external view returns (CodeSnippet memory);
    function getAuthorCodes(address author) external view returns (uint256[] memory);
    function getAllActiveCodes(uint256 offset, uint256 limit) external view returns (uint256[] memory);
    function getCodesByLanguage(Language language, uint256 offset, uint256 limit) external view returns (uint256[] memory);
    function getCodesByCategory(Category category, uint256 offset, uint256 limit) external view returns (uint256[] memory);
    function isContentRegistered(string calldata ipfsHash) external view returns (bool);
    function getCodeCount() external view returns (uint256);
    function getActiveCodeCount() external view returns (uint256);

    // Admin functions
    function setPostingFee(uint256 newFee) external;
    function setReputationToken(address newToken) external;
    function withdrawFees() external;
    function addSupportedLanguage(Language language, string calldata name) external;
    function addSupportedCategory(Category category, string calldata name) external;
    function isLanguageSupported(Language language) external view returns (bool);
    function isCategorySupported(Category category) external view returns (bool);

    // Error definitions
    error InvalidIPFSHash();
    error EmptyTitle();
    error DuplicateContent();
    error InvalidLanguage();
    error InvalidCategory();
    error CodeNotFound();
    error NotAuthor();
    error CodeInactive();
    error CircularDependency();
    error InvalidFee();
    error TransferFailed();
    error InvalidInput();
    error VersionLimitReached();
    error AlreadyVoted();
    error NotVoted();
    error EmptyContent();
    error InvalidParentComment();
    error NotRegisteredAgent();
}
