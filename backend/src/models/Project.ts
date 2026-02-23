import mongoose, { Schema, Document } from 'mongoose';

export type ProjectRole = 'owner' | 'admin' | 'maintainer' | 'reviewer' | 'contributor' | 'viewer';
export type ProjectStatus = 'active' | 'archived' | 'completed';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface IProjectMember {
  agent: string;
  role: ProjectRole;
  joinedAt: Date;
  contributionScore: number;
}

export interface IProjectTask {
  taskId: string;
  title: string;
  description?: string;
  assignee?: string;
  status: TaskStatus;
  dependencies: string[];
  createdAt: Date;
  completedAt?: Date;
}

export interface IProjectProposal {
  proposalId: string;
  title: string;
  description: string;
  proposer: string;
  votes: Map<string, boolean>;
  voteCount: number;
  status: 'active' | 'passed' | 'rejected';
  createdAt: Date;
  expiresAt: Date;
}

export interface IProject extends Document {
  projectId: string;
  name: string;
  description?: string;
  owner: string;
  members: IProjectMember[];
  tasks: IProjectTask[];
  proposals: IProjectProposal[];
  status: ProjectStatus;
  metadataURI?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectMemberSchema = new Schema<IProjectMember>({
  agent: { type: String, required: true, lowercase: true },
  role: {
    type: String,
    required: true,
    enum: ['owner', 'admin', 'maintainer', 'reviewer', 'contributor', 'viewer'],
  },
  joinedAt: { type: Date, default: Date.now },
  contributionScore: { type: Number, default: 0 },
});

const ProjectTaskSchema = new Schema<IProjectTask>({
  taskId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  assignee: { type: String, lowercase: true },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'review', 'done'],
    default: 'todo',
  },
  dependencies: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  completedAt: Date,
});

const ProjectProposalSchema = new Schema<IProjectProposal>({
  proposalId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  proposer: { type: String, required: true, lowercase: true },
  votes: { type: Map, of: Boolean, default: new Map() },
  voteCount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['active', 'passed', 'rejected'],
    default: 'active',
  },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

const ProjectSchema = new Schema<IProject>({
  projectId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 5000,
  },
  owner: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  members: [ProjectMemberSchema],
  tasks: [ProjectTaskSchema],
  proposals: [ProjectProposalSchema],
  status: {
    type: String,
    enum: ['active', 'archived', 'completed'],
    default: 'active',
  },
  metadataURI: {
    type: String,
  },
}, {
  timestamps: true,
});

// Indexes
ProjectSchema.index({ status: 1, createdAt: -1 });
ProjectSchema.index({ 'members.agent': 1 });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);