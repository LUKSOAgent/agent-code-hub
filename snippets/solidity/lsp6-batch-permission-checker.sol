// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";

/**
 * @title LSP6BatchPermissionChecker
 * @notice Utility contract to verify LSP6 controller permissions on a
 *         Universal Profile in a single batched on-chain call.
 *
 * USE CASE: Pre-flight permission validation in dApps and smart contracts.
 *           Instead of sending a transaction that will fail due to missing
 *           permissions, check upfront and surface a clear error.
 *
 * EXAMPLE USE CASES:
 * - A dApp verifies a controller has CALL + SETDATA before allowing the user to proceed
 * - A factory contract checks deployer permissions before creating sub-contracts
 * - An AI agent validates its own permissions before attempting privileged actions
 *
 * LSP6 KEY PERMISSION BITMASKS:
 * CHANGEOWNER                  = 0x0000...0001
 * ADDCONTROLLER                = 0x0000...0002
 * EDITPERMISSIONS              = 0x0000...0004
 * ADDEXTENSIONS                = 0x0000...0008
 * CHANGEEXTENSIONS             = 0x0000...0010
 * ADDUNIVERSALRECEIVERDELEGATE = 0x0000...0020
 * CHANGEUNIVERSALRECEIVERDELEGATE = 0x0000...0040 (bit 7)
 * SETDATA                      = 0x0000...0080
 * SUPER_SETDATA                = 0x0000...0100
 * CALL                         = 0x0000...0200
 * SUPER_CALL                   = 0x0000...0400
 * DEPLOY                       = 0x0000...0800
 * SIGN                         = 0x0000...1000
 * EXECUTE_RELAY_CALL           = 0x0000...2000
 *
 * Docs: https://docs.lukso.tech/standards/access-control/lsp6-key-manager#permissions
 */
contract LSP6BatchPermissionChecker {

    /// @dev Prefix for AddressPermissions:Permissions:<address> ERC725Y key
    bytes10 constant _PERMISSIONS_KEY_PREFIX = 0x4b80742de2bf82acb3630000;

    /**
     * @notice Check if a single controller has ALL required permissions on a UP.
     * @param universalProfile    The Universal Profile to check
     * @param controller          The controller address to validate
     * @param requiredPermissions Bitmask of all required permissions OR-ed together
     * @return hasAll   True if controller has every required permission
     * @return missing  Bitmask of only the missing permissions (0 if hasAll = true)
     */
    function checkPermissions(
        address universalProfile,
        address controller,
        bytes32 requiredPermissions
    ) external view returns (bool hasAll, bytes32 missing) {
        bytes32 permissionsKey = _buildPermissionsKey(controller);
        bytes memory rawPermissions = IERC725Y(universalProfile).getData(permissionsKey);

        // Controller not registered on this UP
        if (rawPermissions.length == 0) {
            return (false, requiredPermissions);
        }

        bytes32 granted = abi.decode(rawPermissions, (bytes32));
        bytes32 intersection = granted & requiredPermissions;

        missing = requiredPermissions ^ intersection; // bits required but not granted
        hasAll = (missing == bytes32(0));
    }

    /**
     * @notice Batch check permissions for multiple controllers in a single call.
     *         Uses getDataBatch internally — one RPC round-trip for all controllers.
     * @param universalProfile  The Universal Profile to check against
     * @param controllers       Array of controller addresses to validate
     * @param requiredPerms     Bitmask of required permissions (applied to all controllers)
     * @return results          True/false array, one entry per controller
     */
    function batchCheckPermissions(
        address universalProfile,
        address[] calldata controllers,
        bytes32 requiredPerms
    ) external view returns (bool[] memory results) {
        uint256 controllerCount = controllers.length;
        results = new bool[](controllerCount);

        // Build all ERC725Y data keys for a single getDataBatch call
        bytes32[] memory keys = new bytes32[](controllerCount);
        for (uint256 i = 0; i < controllerCount; i++) {
            keys[i] = _buildPermissionsKey(controllers[i]);
        }

        bytes[] memory rawValues = IERC725Y(universalProfile).getDataBatch(keys);

        for (uint256 i = 0; i < controllerCount; i++) {
            if (rawValues[i].length == 0) {
                results[i] = false;
                continue;
            }
            bytes32 granted = abi.decode(rawValues[i], (bytes32));
            results[i] = (granted & requiredPerms) == requiredPerms;
        }
    }

    /**
     * @dev Build the AddressPermissions:Permissions:<address> ERC725Y key.
     *      Key = bytes10(keccak256("AddressPermissions:Permissions")) + 0x0000 + bytes20(controller)
     */
    function _buildPermissionsKey(address controller) internal pure returns (bytes32) {
        return bytes32(abi.encodePacked(_PERMISSIONS_KEY_PREFIX, controller));
    }
}
