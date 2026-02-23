import { Project, IProject, IProjectMember, IProjectTask, IProjectProposal } from '../models/Project';
import { logger } from '../utils/logger';
import crypto from 'crypto';

export class ProjectService {
  async createProject(data: {
    name: string;
    description?: string;
    owner: string;
    invitees?: string[];
  }): Promise<IProject> {
    const projectId = crypto.randomUUID();

    const members: IProjectMember[] = [
      {
        agent: data.owner.toLowerCase(),
        role: 'owner',
        joinedAt: new Date(),
        contributionScore: 0,
      },
    ];

    // Add invitees as contributors
    if (data.invitees) {
      for (const invitee of data.invitees) {
        members.push({
          agent: invitee.toLowerCase(),
          role: 'contributor',
          joinedAt: new Date(),
          contributionScore: 0,
        });
      }
    }

    const project = new Project({
      projectId,
      name: data.name,
      description: data.description,
      owner: data.owner.toLowerCase(),
      members,
      tasks: [],
      proposals: [],
    });

    await project.save();
    logger.info(`Project created: ${projectId} by ${data.owner}`);

    return project;
  }

  async getProject(projectId: string): Promise<IProject | null> {
    return Project.findOne({ projectId });
  }

  async listProjects(options: {
    member?: string;
    owner?: string;
    status?: IProject['status'];
    limit?: number;
    offset?: number;
  } = {}): Promise<{ projects: IProject[]; total: number }> {
    const query: any = {};

    if (options.status) {
      query.status = options.status;
    }

    if (options.owner) {
      query.owner = options.owner.toLowerCase();
    }

    if (options.member) {
      query['members.agent'] = options.member.toLowerCase();
    }

    const limit = Math.min(options.limit || 20, 100);
    const offset = options.offset || 0;

    const [projects, total] = await Promise.all([
      Project.find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .exec(),
      Project.countDocuments(query),
    ]);

    return { projects, total };
  }

  async inviteMember(
    projectId: string,
    inviter: string,
    invitee: string,
    role: IProjectMember['role'] = 'contributor'
  ): Promise<IProject | null> {
    const project = await Project.findOne({ projectId });
    if (!project) {
      throw new Error('Project not found');
    }

    // Check if inviter has permission
    const inviterMember = project.members.find(
      m => m.agent === inviter.toLowerCase()
    );
    if (!inviterMember || !['owner', 'admin'].includes(inviterMember.role)) {
      throw new Error('Insufficient permissions');
    }

    // Check if invitee already exists
    if (project.members.some(m => m.agent === invitee.toLowerCase())) {
      throw new Error('Agent already a member');
    }

    return Project.findOneAndUpdate(
      { projectId },
      {
        $push: {
          members: {
            agent: invitee.toLowerCase(),
            role,
            joinedAt: new Date(),
            contributionScore: 0,
          },
        },
      },
      { new: true }
    );
  }

  async createTask(
    projectId: string,
    creator: string,
    data: {
      title: string;
      description?: string;
      assignee?: string;
      dependencies?: string[];
    }
  ): Promise<IProject | null> {
    const project = await Project.findOne({ projectId });
    if (!project) {
      throw new Error('Project not found');
    }

    // Check permissions
    const member = project.members.find(m => m.agent === creator.toLowerCase());
    if (!member || !['owner', 'admin', 'maintainer'].includes(member.role)) {
      throw new Error('Insufficient permissions');
    }

    const taskId = crypto.randomUUID();

    return Project.findOneAndUpdate(
      { projectId },
      {
        $push: {
          tasks: {
            taskId,
            title: data.title,
            description: data.description,
            assignee: data.assignee?.toLowerCase(),
            status: 'todo',
            dependencies: data.dependencies || [],
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );
  }

  async updateTaskStatus(
    projectId: string,
    taskId: string,
    agent: string,
    status: IProjectTask['status']
  ): Promise<IProject | null> {
    const project = await Project.findOne({ projectId });
    if (!project) {
      throw new Error('Project not found');
    }

    const task = project.tasks.find(t => t.taskId === taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Check permissions
    const member = project.members.find(m => m.agent === agent.toLowerCase());
    const isAssignee = task.assignee === agent.toLowerCase();
    const canUpdate = member && (
      ['owner', 'admin', 'maintainer'].includes(member.role) || isAssignee
    );

    if (!canUpdate) {
      throw new Error('Insufficient permissions');
    }

    const update: any = { 'tasks.$.status': status };
    if (status === 'done') {
      update['tasks.$.completedAt'] = new Date();
      // Update contributor score
      await Project.updateOne(
        { projectId, 'members.agent': agent.toLowerCase() },
        { $inc: { 'members.$.contributionScore': 10 } }
      );
    }

    return Project.findOneAndUpdate(
      { projectId, 'tasks.taskId': taskId },
      { $set: update },
      { new: true }
    );
  }

  async createProposal(
    projectId: string,
    proposer: string,
    data: {
      title: string;
      description: string;
      expiresInHours?: number;
    }
  ): Promise<IProject | null> {
    const project = await Project.findOne({ projectId });
    if (!project) {
      throw new Error('Project not found');
    }

    // Check if proposer is member
    if (!project.members.some(m => m.agent === proposer.toLowerCase())) {
      throw new Error('Not a project member');
    }

    const proposalId = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (data.expiresInHours || 24));

    return Project.findOneAndUpdate(
      { projectId },
      {
        $push: {
          proposals: {
            proposalId,
            title: data.title,
            description: data.description,
            proposer: proposer.toLowerCase(),
            votes: new Map(),
            voteCount: 0,
            status: 'active',
            createdAt: new Date(),
            expiresAt,
          },
        },
      },
      { new: true }
    );
  }

  async voteOnProposal(
    projectId: string,
    proposalId: string,
    voter: string,
    vote: boolean
  ): Promise<IProject | null> {
    const project = await Project.findOne({ projectId });
    if (!project) {
      throw new Error('Project not found');
    }

    // Check if voter is member
    if (!project.members.some(m => m.agent === voter.toLowerCase())) {
      throw new Error('Not a project member');
    }

    const proposal = project.proposals.find(p => p.proposalId === proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }

    if (proposal.status !== 'active') {
      throw new Error('Proposal not active');
    }

    if (new Date() > proposal.expiresAt) {
      throw new Error('Proposal expired');
    }

    // Update vote
    const voteKey = `proposals.$[proposal].votes.${voter.toLowerCase()}`;
    const voteCount = vote ? 1 : -1;

    return Project.findOneAndUpdate(
      { projectId },
      {
        $set: { [voteKey]: vote },
        $inc: { 'proposals.$[proposal].voteCount': voteCount },
      },
      {
        arrayFilters: [{ 'proposal.proposalId': proposalId }],
        new: true,
      }
    );
  }
}