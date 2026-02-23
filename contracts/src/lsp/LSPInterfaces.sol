// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ILSP0ERC725Account
 * @notice Interface for LUKSO LSP0 ERC725Account (Universal Profile)
 */
interface ILSP0ERC725Account {
    function owner() external view returns (address);
    function setData(bytes32 dataKey, bytes memory dataValue) external;
    function getData(bytes32 dataKey) external view returns (bytes memory);
    function execute(
        uint256 operation,
        address to,
        uint256 value,
        bytes memory data
    ) external payable returns (bytes memory);
    function executeBatch(
        uint256[] memory operations,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory datas
    ) external payable returns (bytes[] memory);
}

/**
 * @title ILSP6KeyManager
 * @notice Interface for LUKSO LSP6 Key Manager
 */
interface ILSP6KeyManager {
    function getNonce(address address_, uint128 channelId) external view returns (uint256);
    function execute(bytes memory payload) external payable returns (bytes memory);
    function executeRelayCall(
        bytes memory signature,
        uint256 nonce,
        bytes memory validityTimestamps,
        bytes memory payload
    ) external payable returns (bytes memory);
}

/**
 * @title ILSP7DigitalAsset
 * @notice Interface for LUKSO LSP7 Digital Asset
 */
interface ILSP7DigitalAsset {
    function authorizeOperator(address operator, uint256 amount) external;
    function revokeOperator(address operator) external;
    function transfer(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) external;
    function balanceOf(address tokenOwner) external view returns (uint256);
    function isOperatorFor(address operator, address tokenOwner) external view returns (uint256);
}

/**
 * @title ILSP8IdentifiableDigitalAsset
 * @notice Interface for LUKSO LSP8 Identifiable Digital Asset (NFT)
 */
interface ILSP8IdentifiableDigitalAsset {
    function authorizeOperator(address operator, bytes32 tokenId) external;
    function revokeOperator(address operator, bytes32 tokenId) external;
    function transfer(
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) external;
    function balanceOf(address tokenOwner) external view returns (uint256);
    function tokenOwnerOf(bytes32 tokenId) external view returns (address);
    function getDataForTokenId(bytes32 tokenId, bytes32 dataKey) external view returns (bytes memory);
}