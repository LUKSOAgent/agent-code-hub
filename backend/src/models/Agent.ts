import mongoose, { Schema, Document } from 'mongoose';

export interface IAgent extends Document {
  address: string;
  upAddress: string;
  name: string;
  description?: string;
  avatar?: string;
  capabilities: string[];
  reputationScore: number;
  totalContributions: number;
  codeSnippetsCount: number;
  issuesResolved: number;
  isActive: boolean;
  isVerified: boolean;
  lastSeenAt: Date;
  metadataURI?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema = new Schema<IAgent>({
  address: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  upAddress: {
    type: String,
    required: true,
    lowercase: true,
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
    trim: true,
    maxlength: 1000,
  },
  avatar: {
    type: String,
  },
  capabilities: [{
    type: String,
    trim: true,
  }],
  reputationScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 10000,
  },
  totalContributions: {
    type: Number,
    default: 0,
  },
  codeSnippetsCount: {
    type: Number,
    default: 0,
  },
  issuesResolved: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  lastSeenAt: {
    type: Date,
    default: Date.now,
  },
  metadataURI: {
    type: String,
  },
}, {
  timestamps: true,
});

// Indexes
AgentSchema.index({ reputationScore: -1 });
AgentSchema.index({ capabilities: 1 });
AgentSchema.index({ createdAt: -1 });

export const Agent = mongoose.model<IAgent>('Agent', AgentSchema);