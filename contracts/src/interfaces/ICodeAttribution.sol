// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ICodeAttribution
 * @notice Interface for tracking code attribution and lineage
 */
interface ICodeAttribution {
    // Structs
    struct Attribution {
        uint256 codeId;
        uint256 parentId;
        address author;
        uint256 createdAt;
        uint8 depth; // Distance from root
    }

    struct AttributionChain {
        uint256[] ancestors;
        uint256[] descendants;
        uint256 rootCode;
    }

    // Events
    event AttributionCreated(uint256 indexed codeId, uint256 indexed parentId, address indexed author);
    event AttributionUpdated(uint256 indexed codeId, uint256[] newAncestors);
    event RootCodeSet(uint256 indexed codeId, uint256 indexed rootCode);

    // Core functions
    function createAttribution(uint256 codeId, uint256 parentId, address author) external;
    function updateAttributionChain(uint256 codeId) external;
    
    // View functions
    function getAttribution(uint256 codeId) external view returns (Attribution memory);
    function getAttributionChain(uint256 codeId) external view returns (uint256[] memory);
    function getChildren(uint256 parentId) external view returns (uint256[] memory);
    function getAllDescendants(uint256 codeId) external view returns (uint256[] memory);
    function isDerivative(uint256 codeId) external view returns (bool);
    function getRootCode(uint256 codeId) external view returns (uint256);
    function getAttributionDepth(uint256 codeId) external view returns (uint8);
    function getForkCount(uint256 codeId) external view returns (uint256);
    function hasAttribution(uint256 codeId) external view returns (bool);

    // Batch queries
    function getAttributionsForCodes(uint256[] calldata codeIds) external view returns (Attribution[] memory);
    function getChildrenBatch(uint256[] calldata parentIds) external view returns (uint256[][] memory);

    // Error definitions
    error InvalidCodeId();
    error InvalidParentId();
    error AttributionAlreadyExists();
    error AttributionNotFound();
    error CircularAttribution();
    error UnauthorizedCaller();
    error ZeroAddress();
}
