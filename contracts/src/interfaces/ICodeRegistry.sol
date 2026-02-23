// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ICodeRegistry
 * @notice Interface for on-chain code snippet registry with IPFS storage
 */
interface ICodeRegistry {
    // ============ Events ============
    event CodeSubmitted(
        bytes32 indexed codeId,
        bytes32 indexed authorAgentId,
        string title,
        CodeType codeType,
        string ipfsHash,
        string[] tags,
        uint256 timestamp
    );
    
    event CodeUpdated(
        bytes32 indexed codeId,
        string newIpfsHash,
        string changeNotes,
        uint256 version,
        uint256 timestamp
    );
    
    event CodeVerified(
        bytes32 indexed codeId,
        bytes32 indexed verifierAgentId,
        bool passed,
        string reportIpfsHash,
        uint256 timestamp
    );
    
    event CodeRated(
        bytes32 indexed codeId,
        bytes32 indexed raterAgentId,
        uint8 rating,
        string commentIpfsHash,
        uint256 timestamp
    );
    
    event CodeDeprecated(
        bytes32 indexed codeId,
        string reason,
        bytes32 recommendedAlternative,
        uint256 timestamp
    );
    
    event LicenseSet(
        bytes32 indexed codeId,
        LicenseType licenseType,
        string customLicenseUri
    );
    
    event CodeForked(
        bytes32 indexed originalCodeId,
        bytes32 indexed forkedCodeId,
        bytes32 indexed forkerAgentId,
        uint256 timestamp
    );

    // ============ Enums ============
    enum CodeType {
        Contract,
        Library,
        Interface,
        Script,
        Test,
        Utility,
        Module
    }
    
    enum LicenseType {
        MIT,
        GPL3,
        Apache2,
        BSD3,
        Unlicense,
        Custom,
        Proprietary
    }
    
    enum VerificationStatus {
        Unverified,
        Pending,
        Verified,
        Failed,
        Deprecated
    }

    // ============ Structs ============
    struct CodeSnippet {
        bytes32 id;
        bytes32 authorAgentId;
        string title;
        string description;
        CodeType codeType;
        string language; // solidity, javascript, python, etc.
        string ipfsHash;
        string[] tags;
        LicenseType license;
        string customLicenseUri;
        uint256 version;
        bytes32[] previousVersions;
        bytes32 parentCodeId; // For forks
        uint256 createdAt;
        uint256 updatedAt;
        VerificationStatus status;
        uint256 totalRatings;
        uint256 ratingSum;
        uint256 usageCount;
        mapping(bytes32 => uint8) ratingsByAgent; // agentId => rating
    }
    
    struct CodeSnippetView {
        bytes32 id;
        bytes32 authorAgentId;
        string title;
        string description;
        CodeType codeType;
        string language;
        string ipfsHash;
        string[] tags;
        LicenseType license;
        string customLicenseUri;
        uint256 version;
        bytes32[] previousVersions;
        bytes32 parentCodeId;
        uint256 createdAt;
        uint256 updatedAt;
        VerificationStatus status;
        uint256 totalRatings;
        uint256 ratingSum;
        uint256 usageCount;
    }
    
    struct VerificationReport {
        bytes32 codeId;
        bytes32 verifierAgentId;
        bool passed;
        string reportIpfsHash;
        uint256 timestamp;
        bytes32[] findings; // References to issues found
    }

    // ============ External Functions ============
    
    /**
     * @notice Submit a new code snippet
     * @param authorAgentId Agent identifier of the author
     * @param title Code snippet title
     * @param description Brief description
     * @param codeType Type of code
     * @param language Programming language
     * @param ipfsHash IPFS hash of the code content
     * @param tags Array of tags for categorization
     * @param license License type
     * @param customLicenseUri URI for custom license (if applicable)
     * @return codeId Unique identifier for the submitted code
     */
    function submitCode(
        bytes32 authorAgentId,
        string calldata title,
        string calldata description,
        CodeType codeType,
        string calldata language,
        string calldata ipfsHash,
        string[] calldata tags,
        LicenseType license,
        string calldata customLicenseUri
    ) external returns (bytes32 codeId);
    
    /**
     * @notice Update an existing code snippet (creates new version)
     * @param codeId Original code identifier
     * @param newIpfsHash New IPFS hash
     * @param changeNotes Description of changes
     * @return newCodeId New version code identifier
     */
    function updateCode(
        bytes32 codeId,
        string calldata newIpfsHash,
        string calldata changeNotes
    ) external returns (bytes32 newCodeId);
    
    /**
     * @notice Fork an existing code snippet
     * @param originalCodeId Code to fork
     * @param forkerAgentId Agent forking the code
     * @param newTitle New title
     * @param newIpfsHash New IPFS hash with modifications
     * @return forkedCodeId New fork identifier
     */
    function forkCode(
        bytes32 originalCodeId,
        bytes32 forkerAgentId,
        string calldata newTitle,
        string calldata newIpfsHash
    ) external returns (bytes32 forkedCodeId);
    
    /**
     * @notice Submit verification report for code
     * @param codeId Code identifier
     * @param verifierAgentId Verifying agent
     * @param passed Whether verification passed
     * @param reportIpfsHash IPFS hash of detailed report
     * @param findings Related issue IDs
     */
    function submitVerification(
        bytes32 codeId,
        bytes32 verifierAgentId,
        bool passed,
        string calldata reportIpfsHash,
        bytes32[] calldata findings
    ) external;
    
    /**
     * @notice Rate a code snippet
     * @param codeId Code identifier
     * @param raterAgentId Rating agent
     * @param rating Rating value (1-5)
     * @param commentIpfsHash IPFS hash of detailed comment
     */
    function rateCode(
        bytes32 codeId,
        bytes32 raterAgentId,
        uint8 rating,
        string calldata commentIpfsHash
    ) external;
    
    /**
     * @notice Mark code as deprecated
     * @param codeId Code identifier
     * @param reason Deprecation reason
     * @param recommendedAlternative Alternative code to use
     */
    function deprecateCode(
        bytes32 codeId,
        string calldata reason,
        bytes32 recommendedAlternative
    ) external;
    
    /**
     * @notice Record usage of a code snippet
     * @param codeId Code identifier
     */
    function recordUsage(bytes32 codeId) external;
    
    // ============ View Functions ============
    
    function getCode(bytes32 codeId) external view returns (CodeSnippetView memory);
    function getCodesByAuthor(bytes32 authorAgentId) external view returns (bytes32[] memory);
    function getCodesByTag(string calldata tag) external view returns (bytes32[] memory);
    function getCodesByType(CodeType codeType) external view returns (bytes32[] memory);
    function getAverageRating(bytes32 codeId) external view returns (uint256);
    function getUserRating(bytes32 codeId, bytes32 agentId) external view returns (uint8);
    function searchCodes(
        string calldata searchTerm,
        CodeType[] calldata types,
        string[] calldata tags,
        uint256 page,
        uint256 pageSize
    ) external view returns (bytes32[] memory);
    function getVerificationHistory(bytes32 codeId) external view returns (VerificationReport[] memory);
    function getForks(bytes32 codeId) external view returns (bytes32[] memory);
    function getLatestVersion(bytes32 codeId) external view returns (bytes32);
    function getCodeCount() external view returns (uint256);
}