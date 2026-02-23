// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/ICodeRegistry.sol";
import "./interfaces/IAgentRegistry.sol";
import "./utils/AccessControl.sol";
import "./utils/IdGenerator.sol";
import "./utils/StringUtils.sol";

/**
 * @title CodeRegistry
 * @notice On-chain code snippet registry with IPFS storage
 */
contract CodeRegistry is ICodeRegistry, AccessControl {
    using StringUtils for string;
    
    // ============ Storage ============
    
    mapping(bytes32 => CodeSnippet) private _codes;
    mapping(bytes32 => bytes32[]) private _codesByAuthor;
    mapping(string => bytes32[]) private _codesByTag;
    mapping(ICodeRegistry.CodeType => bytes32[]) private _codesByType;
    mapping(bytes32 => bytes32[]) private _forks;
    mapping(bytes32 => bytes32) private _latestVersion;
    mapping(bytes32 => VerificationReport[]) private _verificationHistory;
    
    bytes32[] private _allCodes;
    
    IAgentRegistry public agentRegistry;
    
    uint256 private _codeCounter;
    
    // ============ Modifiers ============
    
    modifier codeExists(bytes32 codeId) {
        require(_codes[codeId].id != bytes32(0), "CodeRegistry: code not found");
        _;
    }
    
    modifier onlyAuthor(bytes32 codeId) {
        require(_isAuthor(codeId, msg.sender) || isAdmin(msg.sender), "CodeRegistry: not author");
        _;
    }
    
    modifier validAgent(bytes32 agentId) {
        require(agentRegistry.isRegistered(agentId), "CodeRegistry: agent not registered");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _agentRegistry) {
        require(_agentRegistry != address(0), "CodeRegistry: invalid agent registry");
        agentRegistry = IAgentRegistry(_agentRegistry);
    }
    
    // ============ Internal Functions ============
    
    function _isAuthor(bytes32 codeId, address sender) internal view returns (bool) {
        bytes32 agentId = _codes[codeId].authorAgentId;
        IAgentRegistry.AgentView memory agent = agentRegistry.getAgent(agentId);
        return agent.universalProfile == sender;
    }
    
    function _createCodeId() internal returns (bytes32) {
        _codeCounter++;
        return IdGenerator.generateCodeId(bytes32(uint256(uint160(msg.sender))), block.timestamp, _codeCounter);
    }
    
    // ============ External Functions ============
    
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
    ) external override validAgent(authorAgentId) returns (bytes32 codeId) {
        require(!title.isEmpty(), "CodeRegistry: title required");
        require(!ipfsHash.isEmpty(), "CodeRegistry: IPFS hash required");
        
        codeId = _createCodeId();
        _latestVersion[codeId] = codeId;
        
        CodeSnippet storage code = _codes[codeId];
        code.id = codeId;
        code.authorAgentId = authorAgentId;
        code.title = title;
        code.description = description;
        code.codeType = codeType;
        code.language = language;
        code.ipfsHash = ipfsHash;
        code.tags = tags;
        code.license = license;
        code.customLicenseUri = customLicenseUri;
        code.version = 1;
        code.createdAt = block.timestamp;
        code.updatedAt = block.timestamp;
        code.status = VerificationStatus.Unverified;
        
        _allCodes.push(codeId);
        _codesByAuthor[authorAgentId].push(codeId);
        _codesByType[codeType].push(codeId);
        
        for (uint256 i = 0; i < tags.length; i++) {
            _codesByTag[tags[i]].push(codeId);
        }
        
        // Update agent reputation
        agentRegistry.updateReputation(authorAgentId, 5, "Code submission");
        
        emit CodeSubmitted(codeId, authorAgentId, title, codeType, ipfsHash, tags, block.timestamp);
    }
    
    function updateCode(
        bytes32 codeId,
        string calldata newIpfsHash,
        string calldata changeNotes
    ) external override codeExists(codeId) onlyAuthor(codeId) returns (bytes32 newCodeId) {
        CodeSnippet storage oldCode = _codes[codeId];
        
        newCodeId = _createCodeId();
        
        CodeSnippet storage newCode = _codes[newCodeId];
        newCode.id = newCodeId;
        newCode.authorAgentId = oldCode.authorAgentId;
        newCode.title = oldCode.title;
        newCode.description = changeNotes;
        newCode.codeType = oldCode.codeType;
        newCode.language = oldCode.language;
        newCode.ipfsHash = newIpfsHash;
        newCode.tags = oldCode.tags;
        newCode.license = oldCode.license;
        newCode.customLicenseUri = oldCode.customLicenseUri;
        newCode.version = oldCode.version + 1;
        newCode.previousVersions = oldCode.previousVersions;
        newCode.previousVersions.push(codeId);
        newCode.parentCodeId = oldCode.parentCodeId;
        newCode.createdAt = oldCode.createdAt;
        newCode.updatedAt = block.timestamp;
        newCode.status = VerificationStatus.Unverified;
        
        _allCodes.push(newCodeId);
        _codesByAuthor[oldCode.authorAgentId].push(newCodeId);
        _codesByType[oldCode.codeType].push(newCodeId);
        
        for (uint256 i = 0; i < oldCode.tags.length; i++) {
            _codesByTag[oldCode.tags[i]].push(newCodeId);
        }
        
        _latestVersion[oldCode.id == _latestVersion[oldCode.id] ? oldCode.id : _getRootCodeId(codeId)] = newCodeId;
        
        // Update agent reputation
        agentRegistry.updateReputation(oldCode.authorAgentId, 3, "Code update");
        
        emit CodeUpdated(codeId, newIpfsHash, changeNotes, newCode.version, block.timestamp);
    }
    
    function _getRootCodeId(bytes32 codeId) internal view returns (bytes32) {
        CodeSnippet storage code = _codes[codeId];
        if (code.parentCodeId == bytes32(0) && code.previousVersions.length == 0) {
            return codeId;
        }
        if (code.previousVersions.length > 0) {
            return _getRootCodeId(code.previousVersions[0]);
        }
        return _getRootCodeId(code.parentCodeId);
    }
    
    function forkCode(
        bytes32 originalCodeId,
        bytes32 forkerAgentId,
        string calldata newTitle,
        string calldata newIpfsHash
    ) external override codeExists(originalCodeId) validAgent(forkerAgentId) returns (bytes32 forkedCodeId) {
        CodeSnippet storage original = _codes[originalCodeId];
        
        forkedCodeId = _createCodeId();
        
        CodeSnippet storage fork = _codes[forkedCodeId];
        fork.id = forkedCodeId;
        fork.authorAgentId = forkerAgentId;
        fork.title = newTitle.isEmpty() ? string(abi.encodePacked("Fork: ", original.title)) : newTitle;
        fork.description = original.description;
        fork.codeType = original.codeType;
        fork.language = original.language;
        fork.ipfsHash = newIpfsHash;
        fork.tags = original.tags;
        fork.license = original.license;
        fork.customLicenseUri = original.customLicenseUri;
        fork.version = 1;
        fork.parentCodeId = originalCodeId;
        fork.createdAt = block.timestamp;
        fork.updatedAt = block.timestamp;
        fork.status = VerificationStatus.Unverified;
        
        _allCodes.push(forkedCodeId);
        _codesByAuthor[forkerAgentId].push(forkedCodeId);
        _codesByType[original.codeType].push(forkedCodeId);
        _forks[originalCodeId].push(forkedCodeId);
        
        for (uint256 i = 0; i < original.tags.length; i++) {
            _codesByTag[original.tags[i]].push(forkedCodeId);
        }
        
        // Update agent reputation
        agentRegistry.updateReputation(forkerAgentId, 2, "Code fork");
        
        emit CodeForked(originalCodeId, forkedCodeId, forkerAgentId, block.timestamp);
    }
    
    function submitVerification(
        bytes32 codeId,
        bytes32 verifierAgentId,
        bool passed,
        string calldata reportIpfsHash,
        bytes32[] calldata findings
    ) external override codeExists(codeId) validAgent(verifierAgentId) {
        CodeSnippet storage code = _codes[codeId];
        
        code.status = passed ? VerificationStatus.Verified : VerificationStatus.Failed;
        
        _verificationHistory[codeId].push(VerificationReport({
            codeId: codeId,
            verifierAgentId: verifierAgentId,
            passed: passed,
            reportIpfsHash: reportIpfsHash,
            timestamp: block.timestamp,
            findings: findings
        }));
        
        // Update agent reputation for verifier
        agentRegistry.updateReputation(verifierAgentId, passed ? int256(10) : int256(5), "Code verification");
        
        emit CodeVerified(codeId, verifierAgentId, passed, reportIpfsHash, block.timestamp);
    }
    
    function rateCode(
        bytes32 codeId,
        bytes32 raterAgentId,
        uint8 rating,
        string calldata commentIpfsHash
    ) external override codeExists(codeId) validAgent(raterAgentId) {
        require(rating >= 1 && rating <= 5, "CodeRegistry: rating must be 1-5");
        require(raterAgentId != _codes[codeId].authorAgentId, "CodeRegistry: cannot rate own code");
        
        CodeSnippet storage code = _codes[codeId];
        
        // Remove old rating if exists
        if (code.ratingsByAgent[raterAgentId] > 0) {
            code.ratingSum -= code.ratingsByAgent[raterAgentId];
        } else {
            code.totalRatings++;
        }
        
        code.ratingsByAgent[raterAgentId] = rating;
        code.ratingSum += rating;
        
        emit CodeRated(codeId, raterAgentId, rating, commentIpfsHash, block.timestamp);
    }
    
    function deprecateCode(
        bytes32 codeId,
        string calldata reason,
        bytes32 recommendedAlternative
    ) external override codeExists(codeId) onlyAuthor(codeId) {
        _codes[codeId].status = VerificationStatus.Deprecated;
        
        emit CodeDeprecated(codeId, reason, recommendedAlternative, block.timestamp);
    }
    
    function recordUsage(bytes32 codeId) external override codeExists(codeId) {
        _codes[codeId].usageCount++;
    }
    
    // ============ View Functions ============
    
    function getCode(bytes32 codeId) external view override codeExists(codeId) returns (CodeSnippetView memory) {
        CodeSnippet storage code = _codes[codeId];
        return CodeSnippetView({
            id: code.id,
            authorAgentId: code.authorAgentId,
            title: code.title,
            description: code.description,
            codeType: code.codeType,
            language: code.language,
            ipfsHash: code.ipfsHash,
            tags: code.tags,
            license: code.license,
            customLicenseUri: code.customLicenseUri,
            version: code.version,
            previousVersions: code.previousVersions,
            parentCodeId: code.parentCodeId,
            createdAt: code.createdAt,
            updatedAt: code.updatedAt,
            status: code.status,
            totalRatings: code.totalRatings,
            ratingSum: code.ratingSum,
            usageCount: code.usageCount
        });
    }
    
    function getCodesByAuthor(bytes32 authorAgentId) external view override returns (bytes32[] memory) {
        return _codesByAuthor[authorAgentId];
    }
    
    function getCodesByTag(string calldata tag) external view override returns (bytes32[] memory) {
        return _codesByTag[tag];
    }
    
    function getCodesByType(CodeType codeType) external view override returns (bytes32[] memory) {
        return _codesByType[codeType];
    }
    
    function getAverageRating(bytes32 codeId) external view override codeExists(codeId) returns (uint256) {
        CodeSnippet storage code = _codes[codeId];
        if (code.totalRatings == 0) return 0;
        return code.ratingSum / code.totalRatings;
    }
    
    function getUserRating(bytes32 codeId, bytes32 agentId) external view override codeExists(codeId) returns (uint8) {
        return _codes[codeId].ratingsByAgent[agentId];
    }
    
    function searchCodes(
        string calldata searchTerm,
        CodeType[] calldata types,
        string[] calldata tags,
        uint256 page,
        uint256 pageSize
    ) external view override returns (bytes32[] memory) {
        // Simplified search - in production, use an indexer
        uint256 start = page * pageSize;
        if (start >= _allCodes.length) return new bytes32[](0);
        
        uint256 end = start + pageSize;
        if (end > _allCodes.length) end = _allCodes.length;
        
        bytes32[] memory result = new bytes32[](end - start);
        for (uint256 i = start; i < end; i++) {
            result[i - start] = _allCodes[i];
        }
        return result;
    }
    
    function getVerificationHistory(bytes32 codeId) external view override codeExists(codeId) returns (VerificationReport[] memory) {
        return _verificationHistory[codeId];
    }
    
    function getForks(bytes32 codeId) external view override codeExists(codeId) returns (bytes32[] memory) {
        return _forks[codeId];
    }
    
    function getLatestVersion(bytes32 codeId) external view override codeExists(codeId) returns (bytes32) {
        return _latestVersion[_getRootCodeId(codeId)];
    }
    
    function getCodeCount() external view override returns (uint256) {
        return _allCodes.length;
    }
}