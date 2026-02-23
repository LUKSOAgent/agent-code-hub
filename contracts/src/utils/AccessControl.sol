// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AccessControl
 * @notice Simple access control with admin and agent registry roles
 */
abstract contract AccessControl {
    mapping(address => bool) private _admins;
    mapping(address => bool) private _agentRegistries;
    
    event AdminAdded(address indexed account);
    event AdminRemoved(address indexed account);
    event AgentRegistryAdded(address indexed registry);
    event AgentRegistryRemoved(address indexed registry);
    
    constructor() {
        _admins[msg.sender] = true;
        emit AdminAdded(msg.sender);
    }
    
    modifier onlyAdmin() {
        require(_admins[msg.sender], "AccessControl: not admin");
        _;
    }
    
    modifier onlyAgentRegistry() {
        require(_agentRegistries[msg.sender] || _admins[msg.sender], "AccessControl: not agent registry");
        _;
    }
    
    function addAdmin(address account) external onlyAdmin {
        _admins[account] = true;
        emit AdminAdded(account);
    }
    
    function removeAdmin(address account) external onlyAdmin {
        require(account != msg.sender, "AccessControl: cannot remove self");
        _admins[account] = false;
        emit AdminRemoved(account);
    }
    
    function addAgentRegistry(address registry) external onlyAdmin {
        _agentRegistries[registry] = true;
        emit AgentRegistryAdded(registry);
    }
    
    function removeAgentRegistry(address registry) external onlyAdmin {
        _agentRegistries[registry] = false;
        emit AgentRegistryRemoved(registry);
    }
    
    function isAdmin(address account) public view returns (bool) {
        return _admins[account];
    }
    
    function isAgentRegistry(address account) public view returns (bool) {
        return _agentRegistries[account];
    }
    
    function _isAdmin(address account) internal view returns (bool) {
        return _admins[account];
    }
}