import { ethers } from 'ethers';
import { config } from '../config';
import { logger } from '../utils/logger';

// Contract ABIs (simplified - replace with actual ABIs after deployment)
const AGENT_REGISTRY_ABI = [
  'function registerAgent(string memory metadataURI, bytes32[] memory capabilities) external',
  'function getAgent(address agentAddress) external view returns (tuple(address upAddress, string memory metadataURI, uint256 reputationScore, bool isActive))',
  'event AgentRegistered(address indexed agent, string metadataURI)',
];

const CODE_REGISTRY_ABI = [
  'function submitCode(bytes32 contentHash, string memory metadataURI, string memory language) external',
  'event CodeSubmitted(bytes32 indexed codeId, address indexed author, bytes32 contentHash)',
];

export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet?: ethers.Wallet;
  private agentRegistry?: ethers.Contract;
  private codeRegistry?: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.lukso.rpcUrl);

    if (config.lukso.privateKey) {
      this.wallet = new ethers.Wallet(config.lukso.privateKey, this.provider);
    }

    // Initialize contracts if addresses are set
    if (config.contracts.agentRegistry) {
      this.agentRegistry = new ethers.Contract(
        config.contracts.agentRegistry,
        AGENT_REGISTRY_ABI,
        this.wallet || this.provider
      );
    }

    if (config.contracts.codeRegistry) {
      this.codeRegistry = new ethers.Contract(
        config.contracts.codeRegistry,
        CODE_REGISTRY_ABI,
        this.wallet || this.provider
      );
    }
  }

  async verifySignature(
    address: string,
    message: string,
    signature: string
  ): Promise<boolean> {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      logger.error('Signature verification failed:', error);
      return false;
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not configured');
    }
    return this.wallet.signMessage(message);
  }

  async transferLYX(to: string, amount: string): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not configured');
    }

    const tx = await this.wallet.sendTransaction({
      to,
      value: ethers.parseEther(amount),
    });

    logger.info(`LYX transfer: ${amount} to ${to}, tx: ${tx.hash}`);
    return tx.hash;
  }

  async transferERC20(
    tokenAddress: string,
    to: string,
    amount: string
  ): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not configured');
    }

    const erc20Abi = [
      'function transfer(address to, uint256 amount) external returns (bool)',
      'function decimals() external view returns (uint8)',
    ];

    const token = new ethers.Contract(tokenAddress, erc20Abi, this.wallet);
    const decimals = await token.decimals();
    const parsedAmount = ethers.parseUnits(amount, decimals);

    const tx = await token.transfer(to, parsedAmount);
    logger.info(`ERC20 transfer: ${amount} to ${to}, tx: ${tx.hash}`);

    return tx.hash;
  }

  async getBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }

  async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  // Contract interaction methods
  async registerAgentOnChain(
    metadataURI: string,
    capabilities: string[]
  ): Promise<string> {
    if (!this.agentRegistry || !this.wallet) {
      throw new Error('Agent registry not configured');
    }

    const capabilityHashes = capabilities.map(c =>
      ethers.keccak256(ethers.toUtf8Bytes(c))
    );

    const tx = await this.agentRegistry.registerAgent(
      metadataURI,
      capabilityHashes
    );

    await tx.wait();
    return tx.hash;
  }

  async submitCodeOnChain(
    contentHash: string,
    metadataURI: string,
    language: string
  ): Promise<string> {
    if (!this.codeRegistry || !this.wallet) {
      throw new Error('Code registry not configured');
    }

    const tx = await this.codeRegistry.submitCode(
      contentHash,
      metadataURI,
      language
    );

    await tx.wait();
    return tx.hash;
  }
}