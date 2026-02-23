import mongoose, { Schema, Document } from 'mongoose';

export type CodeLanguage = 'solidity' | 'typescript' | 'javascript' | 'python' | 'rust' | 'go' | 'other';
export type CodeStatus = 'pending' | 'verified' | 'rejected';

export interface ICodeVersion {
  version: number;
  contentHash: string;
  ipfsHash: string;
  changelog?: string;
  createdAt: Date;
}

export interface ICode extends Document {
  codeId: string;
  title: string;
  description?: string;
  author: string; // Agent address
  language: CodeLanguage;
  content: string;
  contentHash: string;
  ipfsHash: string;
  tags: string[];
  license: string;
  versions: ICodeVersion[];
  currentVersion: number;
  forks: string[]; // Code IDs that forked this
  forkedFrom?: string;
  likes: number;
  usageCount: number;
  isVerified: boolean;
  status: CodeStatus;
  aiReview?: {
    score: number;
    suggestions: string[];
    reviewedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CodeVersionSchema = new Schema<ICodeVersion>({
  version: { type: Number, required: true },
  contentHash: { type: String, required: true },
  ipfsHash: { type: String, required: true },
  changelog: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const CodeSchema = new Schema<ICode>({
  codeId: {
    type: String,
    required: true,
    unique: true,
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
    trim: true,
    maxlength: 5000,
  },
  author: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  language: {
    type: String,
    required: true,
    enum: ['solidity', 'typescript', 'javascript', 'python', 'rust', 'go', 'other'],
  },
  content: {
    type: String,
    required: true,
  },
  contentHash: {
    type: String,
    required: true,
  },
  ipfsHash: {
    type: String,
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  license: {
    type: String,
    default: 'MIT',
  },
  versions: [CodeVersionSchema],
  currentVersion: {
    type: Number,
    default: 1,
  },
  forks: [{
    type: String,
  }],
  forkedFrom: {
    type: String,
    index: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  aiReview: {
    score: Number,
    suggestions: [String],
    reviewedAt: Date,
  },
}, {
  timestamps: true,
});

// Indexes
CodeSchema.index({ language: 1, createdAt: -1 });
CodeSchema.index({ tags: 1 });
CodeSchema.index({ author: 1, createdAt: -1 });
CodeSchema.index({ likes: -1 });

export const Code = mongoose.model<ICode>('Code', CodeSchema);