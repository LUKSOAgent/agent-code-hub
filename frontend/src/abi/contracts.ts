export const CODE_REGISTRY_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string[]",
        "name": "tags",
        "type": "string[]"
      },
      {
        "internalType": "string",
        "name": "language",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "version",
        "type": "string"
      }
    ],
    "name": "registerCode",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "codeId",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "codeId",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "newIpfsHash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "version",
        "type": "string"
      }
    ],
    "name": "updateCode",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "codeId",
        "type": "bytes32"
      }
    ],
    "name": "getCode",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "creator",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "ipfsHash",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "string[]",
            "name": "tags",
            "type": "string[]"
          },
          {
            "internalType": "string",
            "name": "language",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "version",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "updatedAt",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "exists",
            "type": "bool"
          }
        ],
        "internalType": "struct CodeRegistry.Code",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      }
    ],
    "name": "getCodesByCreator",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "tag",
        "type": "string"
      }
    ],
    "name": "getCodesByTag",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllCodes",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "codeId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      }
    ],
    "name": "CodeRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "codeId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "newIpfsHash",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "version",
        "type": "string"
      }
    ],
    "name": "CodeUpdated",
    "type": "event"
  }
] as const

export const CODE_ATTRIBUTION_ABI = [
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "codeId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "contributor",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "share",
        "type": "uint256"
      }
    ],
    "name": "addAttribution",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "codeId",
        "type": "bytes32"
      }
    ],
    "name": "getAttributions",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "contributor",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "share",
            "type": "uint256"
          }
        ],
        "internalType": "struct CodeAttribution.Attribution[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "codeId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "contributor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "share",
        "type": "uint256"
      }
    ],
    "name": "AttributionAdded",
    "type": "event"
  }
] as const

export const REPUTATION_TOKEN_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "getReputation",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "ReputationMinted",
    "type": "event"
  }
] as const
