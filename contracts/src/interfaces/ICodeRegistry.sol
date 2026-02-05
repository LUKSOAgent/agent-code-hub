// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ICodeRegistry
 * @notice Interface for the CodeRegistry contract that manages code snippets
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

    // Events
    event CodePosted(uint256 indexed id, address indexed author, string ipfsHash, string title);
    event CodeUpdated(uint256 indexed id, uint256 indexed newId, address indexed author);
    event CodeForked(uint256 indexed parentId, uint256 indexed childId, address indexed forker);
    event CodeDeactivated(uint256 indexed id, address indexed author);
    event LanguageAdded(Language language, string name);
    event CategoryAdded(Category category, string name);
    event PostingFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeesWithdrawn(address indexed owner, uint256 amount);

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
}
