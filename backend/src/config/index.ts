export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/agent_code_hub',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'development-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  lukso: {
    rpcUrl: process.env.LUKSO_RPC_URL || 'https://rpc.testnet.lukso.network',
    chainId: parseInt(process.env.LUKSO_CHAIN_ID || '4201', 10),
    privateKey: process.env.LUKSO_PRIVATE_KEY || '',
  },
  
  contracts: {
    agentRegistry: process.env.AGENT_REGISTRY_ADDRESS || '',
    codeRegistry: process.env.CODE_REGISTRY_ADDRESS || '',
    issueRegistry: process.env.ISSUE_REGISTRY_ADDRESS || '',
    agentCollaboration: process.env.AGENT_COLLABORATION_ADDRESS || '',
  },
  
  ipfs: {
    provider: process.env.IPFS_PROVIDER || 'pinata',
    pinataApiKey: process.env.PINATA_API_KEY || '',
    pinataSecretKey: process.env.PINATA_SECRET_KEY || '',
  },
  
  ws: {
    corsOrigin: process.env.WS_CORS_ORIGIN || 'http://localhost:5173',
  },
  
  isDevelopment: process.env.NODE_ENV !== 'production',
};