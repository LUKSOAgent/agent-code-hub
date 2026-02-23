import { Agent, IAgent } from '../models/Agent';
import { logger } from '../utils/logger';
import { BlockchainService } from './blockchain';

export class AgentService {
  private blockchain: BlockchainService;

  constructor() {
    this.blockchain = new BlockchainService();
  }

  async registerAgent(data: {
    address: string;
    upAddress: string;
    name: string;
    description?: string;
    capabilities: string[];
    signature: string;
  }): Promise<IAgent> {
    // Verify signature
    const isValid = await this.blockchain.verifySignature(
      data.address,
      `Register agent: ${data.name}`,
      data.signature
    );

    if (!isValid) {
      throw new Error('Invalid signature');
    }

    // Check if agent already exists
    const existingAgent = await Agent.findOne({ address: data.address });
    if (existingAgent) {
      throw new Error('Agent already registered');
    }

    // Create agent
    const agent = new Agent({
      address: data.address,
      upAddress: data.upAddress,
      name: data.name,
      description: data.description,
      capabilities: data.capabilities,
      reputationScore: 0,
    });

    await agent.save();
    logger.info(`Agent registered: ${agent.name} (${agent.address})`);

    return agent;
  }

  async getAgent(address: string): Promise<IAgent | null> {
    return Agent.findOne({ address: address.toLowerCase() });
  }

  async getAgentByUP(upAddress: string): Promise<IAgent | null> {
    return Agent.findOne({ upAddress: upAddress.toLowerCase() });
  }

  async updateAgent(
    address: string,
    updates: Partial<Pick<IAgent, 'name' | 'description' | 'capabilities'>>
  ): Promise<IAgent | null> {
    return Agent.findOneAndUpdate(
      { address: address.toLowerCase() },
      { $set: updates },
      { new: true }
    );
  }

  async listAgents(options: {
    capability?: string;
    sortBy?: 'reputation' | 'recent' | 'contributions';
    limit?: number;
    offset?: number;
  } = {}): Promise<{ agents: IAgent[]; total: number }> {
    const query: any = { isActive: true };
    
    if (options.capability) {
      query.capabilities = options.capability.toLowerCase();
    }

    let sort: any = { createdAt: -1 };
    if (options.sortBy === 'reputation') {
      sort = { reputationScore: -1 };
    } else if (options.sortBy === 'contributions') {
      sort = { totalContributions: -1 };
    }

    const limit = Math.min(options.limit || 20, 100);
    const offset = options.offset || 0;

    const [agents, total] = await Promise.all([
      Agent.find(query)
        .sort(sort)
        .skip(offset)
        .limit(limit)
        .exec(),
      Agent.countDocuments(query),
    ]);

    return { agents, total };
  }

  async updateReputation(address: string, delta: number): Promise<void> {
    await Agent.updateOne(
      { address: address.toLowerCase() },
      {
        $inc: { reputationScore: delta },
        $set: { lastSeenAt: new Date() },
      }
    );
  }

  async updateStats(
    address: string,
    stats: Partial<Pick<IAgent, 'totalContributions' | 'codeSnippetsCount' | 'issuesResolved'>>
  ): Promise<void> {
    await Agent.updateOne(
      { address: address.toLowerCase() },
      { $inc: stats }
    );
  }

  async setOnline(address: string): Promise<void> {
    await Agent.updateOne(
      { address: address.toLowerCase() },
      { $set: { lastSeenAt: new Date() } }
    );
  }
}