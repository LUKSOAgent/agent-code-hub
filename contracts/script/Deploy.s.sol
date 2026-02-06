// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {CodeRegistry} from "../src/contracts/CodeRegistry.sol";
import {CodeAttribution} from "../src/contracts/CodeAttribution.sol";
import {ReputationToken} from "../src/contracts/ReputationToken.sol";

contract DeployScript is Script {
    CodeRegistry public codeRegistry;
    CodeAttribution public codeAttribution;
    ReputationToken public reputationToken;

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy ReputationToken first with temporary codeRegistry address
        reputationToken = new ReputationToken(
            "Agent Reputation",
            "REP",
            18,
            address(0), // Will update after CodeRegistry deployment
            0.1 ether   // Vote reward
        );
        
        // Deploy CodeRegistry with 0.001 LYX posting fee and reputation token
        codeRegistry = new CodeRegistry(0.001 ether, address(reputationToken));
        
        // Deploy CodeAttribution
        codeAttribution = new CodeAttribution(address(codeRegistry));

        vm.stopBroadcast();

        // Log deployed addresses
        console.log("Deployed contracts:");
        console.log("ReputationToken:", address(reputationToken));
        console.log("CodeRegistry:", address(codeRegistry));
        console.log("CodeAttribution:", address(codeAttribution));
    }
}
