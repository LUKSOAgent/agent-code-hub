// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {LSP7DigitalAsset} from "@lukso/lsp7-contracts/contracts/LSP7DigitalAsset.sol";

/**
 * @title TaxedLSP7Token
 * @notice LSP7 fungible token that takes a configurable fee on every transfer
 *         and routes it to a treasury Universal Profile.
 *
 * USE CASE: Protocol revenue — every token transfer automatically funds the
 *           DAO treasury or project wallet. Common in DeFi (fee-on-transfer tokens),
 *           now available natively for LSP7 on LUKSO.
 *
 * EXAMPLES:
 * - 1%  tax (100 basis points)  → sustainability fund
 * - 2.5% tax (250 basis points) → DAO treasury
 * - 0.5% tax (50 basis points)  → liquidity incentives
 *
 * HOW IT WORKS:
 * - Overrides LSP7's _beforeTokenTransfer hook
 * - On every non-mint, non-burn transfer: computes tax, routes to treasury
 * - The recipient always receives (amount - tax); the treasury receives tax
 * - Tax-exempt: mint (from = 0), burn (to = 0), treasury self-transfers
 *
 * NOTES:
 * - Max tax capped at 10% to prevent abuse
 * - Treasury and tax rate are updatable by the contract owner
 * - Treasury address can be a Universal Profile for full LSP compatibility
 */
contract TaxedLSP7Token is LSP7DigitalAsset {

    /// @notice Treasury address that receives the transfer tax
    address public treasury;

    /// @notice Tax rate in basis points (1 bp = 0.01%). Max: 1000 (= 10%)
    uint256 public taxBasisPoints;

    event TaxCollected(address indexed from, address indexed to, uint256 taxAmount);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event TaxRateUpdated(uint256 oldBasisPoints, uint256 newBasisPoints);

    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        address treasury_,
        uint256 taxBasisPoints_,
        uint256 initialSupply_
    ) LSP7DigitalAsset(name_, symbol_, newOwner_, 0, false) {
        require(treasury_ != address(0), "TaxedLSP7: zero treasury address");
        require(taxBasisPoints_ <= 1000, "TaxedLSP7: tax exceeds 10% maximum");

        treasury = treasury_;
        taxBasisPoints = taxBasisPoints_;

        if (initialSupply_ > 0) {
            _mint(newOwner_, initialSupply_, true, "");
        }
    }

    /**
     * @dev Hook called before every token transfer.
     *      Intercepts the transfer and routes the tax portion to the treasury.
     */
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal override {
        super._beforeTokenTransfer(operator, from, to, amount, force, data);

        // Skip tax on mint, burn, and treasury-involved transfers
        if (from == address(0) || to == address(0)) return;
        if (from == treasury || to == treasury) return;

        uint256 taxAmount = (amount * taxBasisPoints) / 10_000;
        if (taxAmount == 0) return;

        _transfer(from, treasury, taxAmount, true, "");
        emit TaxCollected(from, to, taxAmount);
    }

    // ── Admin functions ────────────────────────────────────────────────────

    /// @notice Update the treasury address (owner only)
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "TaxedLSP7: zero address");
        emit TreasuryUpdated(treasury, newTreasury);
        treasury = newTreasury;
    }

    /// @notice Update the tax rate (owner only, max 10%)
    function setTaxRate(uint256 newBasisPoints) external onlyOwner {
        require(newBasisPoints <= 1000, "TaxedLSP7: exceeds 10% maximum");
        emit TaxRateUpdated(taxBasisPoints, newBasisPoints);
        taxBasisPoints = newBasisPoints;
    }
}
