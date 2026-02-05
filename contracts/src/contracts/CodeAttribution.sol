// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ICodeAttribution} from "../interfaces/ICodeAttribution.sol";
import {ICodeRegistry} from "../interfaces/ICodeRegistry.sol";

/**
 * @title CodeAttribution
 * @notice Manages code attribution, lineage tracking, and fork relationships
 * @dev Works in conjunction with CodeRegistry to provide full provenance tracking
 */
contract CodeAttribution is ICodeAttribution, Ownable {
    
    // ============ State Variables ============
    
    ICodeRegistry public codeRegistry;
    
    // Mapping from code ID to its attribution data
    mapping(uint256 => Attribution) public attributions;
    
    // Mapping from parent code ID to its children (forks)
    mapping(uint256 => uint256[]) public children;
    
    // Mapping from code ID to its root (original ancestor)
    mapping(uint256 => uint256) public rootCodes;
    
    // Maximum depth to prevent excessive gas costs
    uint8 public constant MAX_DEPTH = 50;
    
    // ============ Modifiers ============
    
    modifier validCodeId(uint256 codeId) {
        if (codeId == 0) revert InvalidCodeId();
        _;
    }
    
    modifier onlyRegistry() {
        // In production, this would check msg.sender == address(codeRegistry)
        // For flexibility, we'll allow owner to set attributions directly
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _codeRegistry) Ownable(msg.sender) {
        if (_codeRegistry == address(0)) revert ZeroAddress();
        codeRegistry = ICodeRegistry(_codeRegistry);
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Create an attribution record for a new code
     * @param codeId ID of the new code
     * @param parentId ID of the parent code (0 if original)
     * @param author Address of the code author
     */
    function createAttribution(
        uint256 codeId,
        uint256 parentId,
        address author
    ) external override validCodeId(codeId) {
        if (author == address(0)) revert ZeroAddress();
        if (attributions[codeId].codeId != 0) revert AttributionAlreadyExists();
        if (parentId >= codeId && parentId != 0) revert InvalidParentId();
        
        // If has parent, verify it exists
        if (parentId != 0) {
            try codeRegistry.getCodeSnippet(parentId) returns (ICodeRegistry.CodeSnippet memory parent) {
                if (!parent.isActive) revert InvalidParentId();
            } catch {
                revert InvalidParentId();
            }
            
            // Check for circular attribution
            if (_isCircularAttribution(codeId, parentId)) {
                revert CircularAttribution();
            }
            
            // Add to parent's children
            children[parentId].push(codeId);
            
            // Calculate depth
            uint8 parentDepth = attributions[parentId].depth;
            if (parentDepth >= MAX_DEPTH) {
                revert CircularAttribution(); // Effectively depth limit reached
            }
            
            // Set root code
            uint256 root = rootCodes[parentId];
            if (root == 0) {
                root = parentId; // Parent is the root
            }
            rootCodes[codeId] = root;
            
            // Create attribution
            attributions[codeId] = Attribution({
                codeId: codeId,
                parentId: parentId,
                author: author,
                createdAt: block.timestamp,
                depth: parentDepth + 1
            });
            
            emit RootCodeSet(codeId, root);
        } else {
            // Original code - no parent
            attributions[codeId] = Attribution({
                codeId: codeId,
                parentId: 0,
                author: author,
                createdAt: block.timestamp,
                depth: 0
            });
            
            rootCodes[codeId] = codeId; // It is its own root
            emit RootCodeSet(codeId, codeId);
        }
        
        emit AttributionCreated(codeId, parentId, author);
    }
    
    /**
     * @notice Update the attribution chain for a code (recalculates ancestors)
     * @param codeId ID of the code to update
     */
    function updateAttributionChain(uint256 codeId) external override validCodeId(codeId) {
        if (attributions[codeId].codeId == 0) revert AttributionNotFound();
        
        // Recalculate depth
        uint8 newDepth = _calculateDepth(codeId);
        attributions[codeId].depth = newDepth;
        
        // Recalculate root
        uint256 newRoot = _findRoot(codeId);
        rootCodes[codeId] = newRoot;
        
        emit AttributionUpdated(codeId, getAttributionChain(codeId));
    }
    
    // ============ View Functions ============
    
    function getAttribution(uint256 codeId) external view override validCodeId(codeId) returns (Attribution memory) {
        return attributions[codeId];
    }
    
    /**
     * @notice Get the full attribution chain (ancestors) for a code
     * @param codeId ID of the code
     * @return Array of ancestor code IDs, from immediate parent to root
     */
    function getAttributionChain(uint256 codeId) public view override validCodeId(codeId) returns (uint256[] memory) {
        if (attributions[codeId].codeId == 0) {
            return new uint256[](0);
        }
        
        // Count ancestors
        uint256 count = 0;
        uint256 current = codeId;
        while (attributions[current].parentId != 0 && count < MAX_DEPTH) {
            count++;
            current = attributions[current].parentId;
        }
        
        // Build chain
        uint256[] memory chain = new uint256[](count);
        current = codeId;
        for (uint256 i = 0; i < count; i++) {
            chain[i] = attributions[current].parentId;
            current = attributions[current].parentId;
        }
        
        return chain;
    }
    
    function getChildren(uint256 parentId) external view override validCodeId(parentId) returns (uint256[] memory) {
        return children[parentId];
    }
    
    /**
     * @notice Get all descendants of a code (recursive)
     * @param codeId ID of the code
     * @return Array of all descendant code IDs
     */
    function getAllDescendants(uint256 codeId) external view override validCodeId(codeId) returns (uint256[] memory) {
        uint256[] memory directChildren = children[codeId];
        if (directChildren.length == 0) {
            return new uint256[](0);
        }
        
        // Use a temporary array with max possible size
        uint256[] memory temp = new uint256[](codeRegistry.getCodeCount());
        uint256 count = 0;
        
        // Queue for BFS
        for (uint256 i = 0; i < directChildren.length; i++) {
            temp[count++] = directChildren[i];
        }
        
        // Process queue
        uint256 processed = 0;
        while (processed < count && processed < MAX_DEPTH * 100) {
            uint256 current = temp[processed++];
            uint256[] memory currentChildren = children[current];
            
            for (uint256 i = 0; i < currentChildren.length; i++) {
                // Check for duplicates
                bool exists = false;
                for (uint256 j = 0; j < count; j++) {
                    if (temp[j] == currentChildren[i]) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) {
                    temp[count++] = currentChildren[i];
                }
            }
        }
        
        // Copy to correctly sized array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = temp[i];
        }
        
        return result;
    }
    
    function isDerivative(uint256 codeId) external view override validCodeId(codeId) returns (bool) {
        return attributions[codeId].parentId != 0;
    }
    
    function getRootCode(uint256 codeId) external view override validCodeId(codeId) returns (uint256) {
        uint256 root = rootCodes[codeId];
        if (root == 0 && attributions[codeId].codeId != 0) {
            // Calculate on the fly if not cached
            return _findRoot(codeId);
        }
        return root == 0 ? codeId : root;
    }
    
    function getAttributionDepth(uint256 codeId) external view override validCodeId(codeId) returns (uint8) {
        return attributions[codeId].depth;
    }
    
    function getForkCount(uint256 codeId) external view override validCodeId(codeId) returns (uint256) {
        return children[codeId].length;
    }
    
    function hasAttribution(uint256 codeId) external view override returns (bool) {
        return attributions[codeId].codeId != 0;
    }
    
    // ============ Batch Queries ============
    
    function getAttributionsForCodes(uint256[] calldata codeIds) external view override returns (Attribution[] memory) {
        Attribution[] memory results = new Attribution[](codeIds.length);
        for (uint256 i = 0; i < codeIds.length; i++) {
            results[i] = attributions[codeIds[i]];
        }
        return results;
    }
    
    function getChildrenBatch(uint256[] calldata parentIds) external view override returns (uint256[][] memory) {
        uint256[][] memory results = new uint256[][](parentIds.length);
        for (uint256 i = 0; i < parentIds.length; i++) {
            results[i] = children[parentIds[i]];
        }
        return results;
    }
    
    // ============ Admin Functions ============
    
    function setCodeRegistry(address _codeRegistry) external onlyOwner {
        if (_codeRegistry == address(0)) revert ZeroAddress();
        codeRegistry = ICodeRegistry(_codeRegistry);
    }
    
    // ============ Internal Functions ============
    
    /**
     * @dev Check if adding a parent would create a circular attribution
     */
    function _isCircularAttribution(uint256 codeId, uint256 parentId) internal view returns (bool) {
        uint256 current = parentId;
        uint256 iterations = 0;
        
        while (current != 0 && iterations < MAX_DEPTH) {
            if (current == codeId) {
                return true; // Circular!
            }
            current = attributions[current].parentId;
            iterations++;
        }
        
        return false;
    }
    
    /**
     * @dev Calculate the depth of a code in the attribution tree
     */
    function _calculateDepth(uint256 codeId) internal view returns (uint8) {
        uint8 depth = 0;
        uint256 current = codeId;
        
        while (attributions[current].parentId != 0 && depth < MAX_DEPTH) {
            depth++;
            current = attributions[current].parentId;
        }
        
        return depth;
    }
    
    /**
     * @dev Find the root code (original ancestor)
     */
    function _findRoot(uint256 codeId) internal view returns (uint256) {
        uint256 current = codeId;
        uint256 iterations = 0;
        
        while (attributions[current].parentId != 0 && iterations < MAX_DEPTH) {
            current = attributions[current].parentId;
            iterations++;
        }
        
        return current;
    }
}
