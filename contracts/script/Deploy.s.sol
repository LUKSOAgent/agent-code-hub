// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/AgentRegistry.sol";
import "../src/CodeRegistry.sol";
import "../src/IssueRegistry.sol";
import "../src/AgentCollaboration.sol";

/**
 * @title DeployAgentCodeHub
 * @notice Deployment script for Agent Code Hub contracts on LUKSO
 * @dev Run with: forge script script/Deploy.s.sol:DeployAgentCodeHub --rpc-url <LUKSO_RPC> --broadcast
 */
contract DeployAgentCodeHub is Script {
    
    // LUKSO Mainnet addresses (for reference)
    address constant LUKSO_MAINNET_UP_FACTORY = 0x0000000000000000000000000000000000000000; // Update with actual
    
    // Contract instances
    AgentRegistry public agentRegistry;
    CodeRegistry public codeRegistry;
    IssueRegistry public issueRegistry;
    AgentCollaboration public agentCollaboration;
    
    function setUp() public {}
    
    function run() public virtual {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying Agent Code Hub contracts...");
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy AgentRegistry first (other contracts depend on it)
        agentRegistry = new AgentRegistry();
        console.log("AgentRegistry deployed at:", address(agentRegistry));
        
        // Deploy CodeRegistry
        codeRegistry = new CodeRegistry(address(agentRegistry));
        console.log("CodeRegistry deployed at:", address(codeRegistry));
        
        // Deploy IssueRegistry
        issueRegistry = new IssueRegistry(address(agentRegistry));
        console.log("IssueRegistry deployed at:", address(issueRegistry));
        
        // Deploy AgentCollaboration
        agentCollaboration = new AgentCollaboration(address(agentRegistry));
        console.log("AgentCollaboration deployed at:", address(agentCollaboration));
        
        // Configure contract relationships
        agentRegistry.addAgentRegistry(address(codeRegistry));
        agentRegistry.addAgentRegistry(address(issueRegistry));
        agentRegistry.addAgentRegistry(address(agentCollaboration));
        console.log("AgentRegistry permissions configured");
        
        // Add verifiers (can be done post-deployment)
        // agentRegistry.addVerifier(verifierAddress);
        
        vm.stopBroadcast();
        
        // Output summary
        console.log("\n=== Deployment Summary ===");
        console.log("AgentRegistry:", address(agentRegistry));
        console.log("CodeRegistry:", address(codeRegistry));
        console.log("IssueRegistry:", address(issueRegistry));
        console.log("AgentCollaboration:", address(agentCollaboration));
        
        // Write deployment info to file
        string memory deploymentInfo = string(abi.encodePacked(
            "{\n",
            '  "chainId": ', vm.toString(block.chainid), ",\n",
            '  "deployer": "', vm.toString(deployer), '",\n',
            '  "AgentRegistry": "', vm.toString(address(agentRegistry)), '",\n',
            '  "CodeRegistry": "', vm.toString(address(codeRegistry)), '",\n',
            '  "IssueRegistry": "', vm.toString(address(issueRegistry)), '",\n',
            '  "AgentCollaboration": "', vm.toString(address(agentCollaboration)), '",\n',
            '  "timestamp": ', vm.toString(block.timestamp), "\n",
            "}"
        ));
        
        vm.writeFile(
            string(abi.encodePacked("deployments/", vm.toString(block.chainid), ".json")),
            deploymentInfo
        );
    }
}

/**
 * @title DeployToLuksoTestnet
 * @notice Deployment configuration for LUKSO Testnet
 */
contract DeployToLuksoTestnet is DeployAgentCodeHub {
    // LUKSO Testnet configuration
    function run() override public {
        // LUKSO Testnet chain ID is 4201
        console.log("Deploying to LUKSO Testnet (Chain ID: 4201)");
        super.run();
    }
}

/**
 * @title DeployToLuksoMainnet
 * @notice Deployment configuration for LUKSO Mainnet
 */
contract DeployToLuksoMainnet is DeployAgentCodeHub {
    // LUKSO Mainnet configuration
    function run() override public {
        // LUKSO Mainnet chain ID is 42
        console.log("Deploying to LUKSO Mainnet (Chain ID: 42)");
        super.run();
    }
}