// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ILSP7DigitalAsset
 * @notice Interface for LSP7 Digital Asset standard (simplified for LUKSO compatibility)
 * @dev LSP7 is the fungible token standard on LUKSO, similar to ERC20 but with additional features
 */
interface ILSP7DigitalAsset {
    // Events
    event Transfer(address indexed operator, address indexed from, address indexed to, uint256 amount, bool force, bytes data);
    event AuthorizedOperator(address indexed operator, address indexed tokenOwner, uint256 amount);
    event RevokedOperator(address indexed operator, address indexed tokenOwner);
    event DataChanged(bytes32 indexed dataKey, bytes dataValue);

    // Functions
    function authorizeOperator(address operator, uint256 amount) external;
    function revokeOperator(address operator) external;
    function authorizedAmountFor(address operator, address tokenOwner) external view returns (uint256);
    function getOperatorsOf(address tokenOwner) external view returns (address[] memory);
    
    function transfer(address from, address to, uint256 amount, bool force, bytes calldata data) external;
    function transferBatch(address[] calldata from, address[] calldata to, uint256[] calldata amount, bool[] calldata force, bytes[] calldata data) external;
    
    function balanceOf(address tokenOwner) external view returns (uint256);
    function totalSupply() external view returns (uint256);
    
    function decimals() external view returns (uint8);
    
    // LSP7 specific
    function mint(address to, uint256 amount, bool force, bytes calldata data) external;
    function burn(address from, uint256 amount, bytes calldata data) external;
}

/**
 * @title ILSP7Mintable
 * @notice Extension interface for mintable LSP7 tokens
 */
interface ILSP7Mintable is ILSP7DigitalAsset {
    function mint(address to, uint256 amount, bool force, bytes memory data) external;
}
