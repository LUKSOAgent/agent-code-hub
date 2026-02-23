import { Code, ICode } from '../models/Code';
import { IPFSService } from './ipfs';
import { logger } from '../utils/logger';
import crypto from 'crypto';

export class CodeService {
  private ipfs: IPFSService;

  constructor() {
    this.ipfs = new IPFSService();
  }

  async createCode(data: {
    author: string;
    title: string;
    description?: string;
    content: string;
    language: ICode['language'];
    tags: string[];
    license?: string;
  }): Promise<ICode> {
    // Calculate content hash
    const contentHash = crypto
      .createHash('sha256')
      .update(data.content)
      .digest('hex');

    // Pin to IPFS
    const ipfsHash = await this.ipfs.pinJSON({
      title: data.title,
      description: data.description,
      content: data.content,
      language: data.language,
      tags: data.tags,
      license: data.license || 'MIT',
    });

    // Generate code ID
    const codeId = crypto.randomUUID();

    const code = new Code({
      codeId,
      title: data.title,
      description: data.description,
      author: data.author.toLowerCase(),
      language: data.language,
      content: data.content,
      contentHash,
      ipfsHash,
      tags: data.tags.map(t => t.toLowerCase()),
      license: data.license || 'MIT',
      versions: [{
        version: 1,
        contentHash,
        ipfsHash,
        changelog: 'Initial version',
      }],
      currentVersion: 1,
    });

    await code.save();
    logger.info(`Code created: ${code.codeId} by ${code.author}`);

    return code;
  }

  async getCode(codeId: string): Promise<ICode | null> {
    return Code.findOne({ codeId });
  }

  async updateCode(
    codeId: string,
    author: string,
    data: {
      content: string;
      changelog?: string;
    }
  ): Promise<ICode | null> {
    const code = await Code.findOne({ codeId, author: author.toLowerCase() });
    if (!code) {
      throw new Error('Code not found or unauthorized');
    }

    const contentHash = crypto
      .createHash('sha256')
      .update(data.content)
      .digest('hex');

    const ipfsHash = await this.ipfs.pinJSON({
      title: code.title,
      description: code.description,
      content: data.content,
      language: code.language,
      tags: code.tags,
      license: code.license,
    });

    const newVersion = code.currentVersion + 1;

    return Code.findOneAndUpdate(
      { codeId },
      {
        $set: {
          content: data.content,
          contentHash,
          ipfsHash,
          currentVersion: newVersion,
        },
        $push: {
          versions: {
            version: newVersion,
            contentHash,
            ipfsHash,
            changelog: data.changelog || `Version ${newVersion}`,
          },
        },
      },
      { new: true }
    );
  }

  async forkCode(
    codeId: string,
    forker: string,
    data: {
      title: string;
      description?: string;
      modifications?: string;
    }
  ): Promise<ICode> {
    const originalCode = await Code.findOne({ codeId });
    if (!originalCode) {
      throw new Error('Original code not found');
    }

    const content = data.modifications || originalCode.content;
    const contentHash = crypto.createHash('sha256').update(content).digest('hex');

    const ipfsHash = await this.ipfs.pinJSON({
      title: data.title,
      description: data.description,
      content,
      language: originalCode.language,
      tags: originalCode.tags,
      license: originalCode.license,
      forkedFrom: originalCode.codeId,
    });

    const newCodeId = crypto.randomUUID();

    const forkedCode = new Code({
      codeId: newCodeId,
      title: data.title,
      description: data.description,
      author: forker.toLowerCase(),
      language: originalCode.language,
      content,
      contentHash,
      ipfsHash,
      tags: originalCode.tags,
      license: originalCode.license,
      forkedFrom: originalCode.codeId,
      versions: [{
        version: 1,
        contentHash,
        ipfsHash,
        changelog: `Forked from ${originalCode.codeId}`,
      }],
    });

    await forkedCode.save();

    // Update original code forks list
    await Code.updateOne(
      { codeId: originalCode.codeId },
      { $push: { forks: newCodeId } }
    );

    logger.info(`Code forked: ${newCodeId} from ${codeId}`);

    return forkedCode;
  }

  async searchCode(options: {
    query?: string;
    language?: string;
    tags?: string[];
    author?: string;
    sortBy?: 'recent' | 'popular';
    limit?: number;
    offset?: number;
  }): Promise<{ codes: ICode[]; total: number }> {
    const query: any = { status: { $in: ['pending', 'verified'] } };

    if (options.query) {
      query.$or = [
        { title: { $regex: options.query, $options: 'i' } },
        { description: { $regex: options.query, $options: 'i' } },
      ];
    }

    if (options.language) {
      query.language = options.language.toLowerCase();
    }

    if (options.tags && options.tags.length > 0) {
      query.tags = { $in: options.tags.map(t => t.toLowerCase()) };
    }

    if (options.author) {
      query.author = options.author.toLowerCase();
    }

    let sort: any = { createdAt: -1 };
    if (options.sortBy === 'popular') {
      sort = { likes: -1 };
    }

    const limit = Math.min(options.limit || 20, 100);
    const offset = options.offset || 0;

    const [codes, total] = await Promise.all([
      Code.find(query)
        .sort(sort)
        .skip(offset)
        .limit(limit)
        .exec(),
      Code.countDocuments(query),
    ]);

    return { codes, total };
  }

  async likeCode(codeId: string, userAddress: string): Promise<void> {
    await Code.updateOne(
      { codeId },
      { $inc: { likes: 1 } }
    );
  }

  async incrementUsage(codeId: string): Promise<void> {
    await Code.updateOne(
      { codeId },
      { $inc: { usageCount: 1 } }
    );
  }
}