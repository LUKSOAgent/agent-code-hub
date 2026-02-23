import mongoose, { Schema, Document } from 'mongoose';

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface ISolution {
  solver: string;
  codeHash: string;
  ipfsHash: string;
  description?: string;
  isAccepted: boolean;
  submittedAt: Date;
}

export interface IBounty {
  amount: string;
  token: string; // 'LYX' or token address
  isNative: boolean;
}

export interface IIssue extends Document {
  issueId: string;
  codeId: string;
  reporter: string;
  assignee?: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  bounty: IBounty;
  solutions: ISolution[];
  acceptedSolution?: ISolution;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

const BountySchema = new Schema<IBounty>({
  amount: { type: String, required: true },
  token: { type: String, required: true },
  isNative: { type: Boolean, default: true },
});

const SolutionSchema = new Schema<ISolution>({
  solver: { type: String, required: true, lowercase: true },
  codeHash: { type: String, required: true },
  ipfsHash: { type: String, required: true },
  description: { type: String },
  isAccepted: { type: Boolean, default: false },
  submittedAt: { type: Date, default: Date.now },
});

const IssueSchema = new Schema<IIssue>({
  issueId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  codeId: {
    type: String,
    required: true,
    index: true,
  },
  reporter: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  assignee: {
    type: String,
    lowercase: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    maxlength: 10000,
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
  },
  status: {
    type: String,
    required: true,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open',
  },
  bounty: {
    type: BountySchema,
    required: true,
  },
  solutions: [SolutionSchema],
  acceptedSolution: SolutionSchema,
  resolvedAt: Date,
}, {
  timestamps: true,
});

// Indexes
IssueSchema.index({ status: 1, createdAt: -1 });
IssueSchema.index({ severity: 1 });
IssueSchema.index({ codeId: 1, status: 1 });
IssueSchema.index({ reporter: 1 });

export const Issue = mongoose.model<IIssue>('Issue', IssueSchema);