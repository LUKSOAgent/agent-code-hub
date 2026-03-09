// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ILSP1UniversalReceiver} from "@lukso/lsp1-contracts/contracts/ILSP1UniversalReceiver.sol";
import {ILSP7DigitalAsset} from "@lukso/lsp7-contracts/contracts/ILSP7DigitalAsset.sol";

/**
 * @title TipOnFollowDelegate
 * @notice LSP1 Universal Receiver Delegate that automatically tips an LSP7 token
 *         to any new Universal Profile follower.
 *
 * USE CASE: Reward followers with tokens automatically — no manual action required.
 *           Think of it as a programmable "follow-to-earn" mechanic on LUKSO.
 *
 * HOW IT WORKS:
 * 1. Someone follows your Universal Profile via the LSP26 Follower Registry
 * 2. LSP26 fires an LSP1 universalReceiver notification on your UP
 * 3. Your UP delegates the call to this contract (registered as LSP1 delegate for
 *    the LSP26 follow typeId)
 * 4. This contract transfers `tipAmount` tokens from your UP to the follower
 *
 * SETUP (on your Universal Profile):
 * - Set the ERC725Y key LSP1UniversalReceiverDelegate:<followTypeId>
 *   → value = address of this contract
 * - Authorize this contract as an LSP7 operator for your tip budget:
 *   tipToken.authorizeOperator(address(this), tipBudget, "")
 *
 * SECURITY:
 * - Only the LSP26 Follower Registry can trigger tips
 * - Tips are wrapped in try/catch — failures never revert the follow transaction
 * - The UP's own LSP7 balance acts as the rate-limiter (tips stop when budget runs out)
 */
contract TipOnFollowDelegate is ILSP1UniversalReceiver {

    /// @dev The LSP26 follow notification typeId
    /// Computed as: keccak256("LSP26FollowerSystem_FollowNotification")
    bytes32 constant _TYPEID_LSP26_FOLLOW =
        0x71e02f9f05bcd5816ec4f3134aa2e5a916669537000000000000000000000000;

    /// @dev LSP26 Follower Registry on LUKSO Mainnet
    address constant LSP26_FOLLOWER_REGISTRY = 0xf01103E5a9909Fc0DBe8166dA7085e0285daDDcA;

    /// @notice The LSP7 token used for tips
    ILSP7DigitalAsset public immutable tipToken;

    /// @notice Amount tipped per new follower (in wei, 18 decimals)
    uint256 public immutable tipAmount;

    event TipSent(address indexed universalProfile, address indexed follower, uint256 amount);
    event TipFailed(address indexed universalProfile, address indexed follower, string reason);

    constructor(address _tipToken, uint256 _tipAmount) {
        require(_tipToken != address(0), "TipOnFollowDelegate: zero token address");
        require(_tipAmount > 0, "TipOnFollowDelegate: tip amount must be > 0");
        tipToken = ILSP7DigitalAsset(_tipToken);
        tipAmount = _tipAmount;
    }

    /**
     * @notice Called by the Universal Profile when a follow notification arrives.
     * @param typeId  The LSP1 type ID — must match the LSP26 follow typeId
     * @param data    ABI-encoded data containing the follower's address
     * @return        Empty bytes (return value is ignored by the UP)
     */
    function universalReceiver(
        bytes32 typeId,
        bytes calldata data
    ) external override returns (bytes memory) {
        // Only handle LSP26 follow notifications
        if (typeId != _TYPEID_LSP26_FOLLOW) return "";

        // Only accept calls originating from the LSP26 Follower Registry
        if (msg.sender != LSP26_FOLLOWER_REGISTRY) return "";

        // Decode follower address from the notification payload (last 20 bytes)
        if (data.length < 20) return "";
        address follower = address(bytes20(data[data.length - 20:]));

        // The UP that received the follow is tx.origin
        address universalProfile = tx.origin;

        // Tip the follower — wrapped in try/catch so we never block the follow tx
        try tipToken.transfer(universalProfile, follower, tipAmount, true, "") {
            emit TipSent(universalProfile, follower, tipAmount);
        } catch Error(string memory reason) {
            emit TipFailed(universalProfile, follower, reason);
        } catch {
            emit TipFailed(universalProfile, follower, "unknown error");
        }

        return "";
    }
}
