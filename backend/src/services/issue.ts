import { Issue, IIssue } from '../models/Issue';
import { logger } from '../utils/logger';
import crypto from 'crypto';
import { BlockchainService } from './blockchain';

export class IssueService {
  private blockchain: BlockchainService;

  constructor() {
    this.blockchain = new BlockchainService();
  }

  async createIssue(data: {
    codeId: string;
    reporter: string;
    title: string;
    description: string;
    severity: IIssue['severity'];
    bounty: {
      amount: string;
      token: string;
      isNative: boolean;
    };
  }): Promise<IIssue> {
    const issueId = crypto.randomUUID();

    const issue = new Issue({
      issueId,
      codeId: data.codeId,
      reporter: data.reporter.toLowerCase(),
      title: data.title,
      description: data.description,
      severity: data.severity,
      bounty: {
        amount: data.bounty.amount,
        token: data.bounty.token,
        isNative: data.bounty.isNative,
      },
    });

    await issue.save();
    logger.info(`Issue created: ${issueId} for code ${data.codeId}`);

    return issue;
  }

  async getIssue(issueId: string): Promise<IIssue | null> {
    return Issue.findOne({ issueId });
  }

  async listIssues(options: {
    codeId?: string;
    reporter?: string;
    assignee?: string;
    status?: IIssue['status'];
    severity?: IIssue['severity'];
    sortBy?: 'recent' | 'bounty';
    limit?: number;
    offset?: number;
  } = {}): Promise<{ issues: IIssue[]; total: number }> {
    const query: any = {};

    if (options.codeId) query.codeId = options.codeId;
    if (options.reporter) query.reporter = options.reporter.toLowerCase();
    if (options.assignee) query.assignee = options.assignee.toLowerCase();
    if (options.status) query.status = options.status;
    if (options.severity) query.severity = options.severity;

    let sort: any = { createdAt: -1 };
    if (options.sortBy === 'bounty') {
      sort = { 'bounty.amount': -1 };
    }

    const limit = Math.min(options.limit || 20, 100);
    const offset = options.offset || 0;

    const [issues, total] = await Promise.all([
      Issue.find(query)
        .sort(sort)
        .skip(offset)
        .limit(limit)
        .exec(),
      Issue.countDocuments(query),
    ]);

    return { issues, total };
  }

  async assignIssue(issueId: string, assignee: string): Promise<IIssue | null> {
    return Issue.findOneAndUpdate(
      { issueId, status: { $in: ['open', 'in_progress'] } },
      {
        $set: {
          assignee: assignee.toLowerCase(),
          status: 'in_progress',
        },
      },
      { new: true }
    );
  }

  async submitSolution(
    issueId: string,
    data: {
      solver: string;
      codeHash: string;
      ipfsHash: string;
      description?: string;
    }
  ): Promise<IIssue | null> {
    return Issue.findOneAndUpdate(
      { issueId },
      {
        $push: {
          solutions: {
            solver: data.solver.toLowerCase(),
            codeHash: data.codeHash,
            ipfsHash: data.ipfsHash,
            description: data.description,
            isAccepted: false,
            submittedAt: new Date(),
          },
        },
      },
      { new: true }
    );
  }

  async acceptSolution(
    issueId: string,
    solutionIndex: number,
    reporter: string
  ): Promise<IIssue | null> {
    const issue = await Issue.findOne({ issueId, reporter: reporter.toLowerCase() });
    if (!issue) {
      throw new Error('Issue not found or unauthorized');
    }

    const solution = issue.solutions[solutionIndex];
    if (!solution) {
      throw new Error('Solution not found');
    }

    // Distribute bounty
    if (issue.bounty.isNative) {
      await this.blockchain.transferLYX(
        solution.solver,
        issue.bounty.amount
      );
    } else {
      await this.blockchain.transferERC20(
        issue.bounty.token,
        solution.solver,
        issue.bounty.amount
      );
    }

    return Issue.findOneAndUpdate(
      { issueId },
      {
        $set: {
          status: 'resolved',
          acceptedSolution: solution,
          resolvedAt: new Date(),
        },
      },
      { new: true }
    );
  }

  async closeIssue(issueId: string, reporter: string): Promise<IIssue | null> {
    return Issue.findOneAndUpdate(
      { issueId, reporter: reporter.toLowerCase() },
      { $set: { status: 'closed' } },
      { new: true }
    );
  }

  async getBountyStats(): Promise<{
    totalBounties: number;
    totalValue: string;
    resolvedIssues: number;
  }> {
    const stats = await Issue.aggregate([
      {
        $group: {
          _id: null,
          totalBounties: { $sum: 1 },
          totalValue: { $sum: { $toDouble: '$bounty.amount' } },
          resolvedIssues: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] },
          },
        },
      },
    ]);

    return stats[0] || { totalBounties: 0, totalValue: '0', resolvedIssues: 0 };
  }
}