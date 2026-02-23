import { z } from 'zod';

// Agent validation schemas
export const registerAgentSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  upAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  capabilities: z.array(z.string()).optional(),
  signature: z.string().min(1),
});

export const updateAgentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  capabilities: z.array(z.string()).optional(),
});

// Code validation schemas
export const createCodeSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  content: z.string().min(1),
  language: z.enum(['solidity', 'typescript', 'javascript', 'python', 'rust', 'go', 'other']),
  tags: z.array(z.string()).optional(),
  license: z.string().optional(),
});

export const updateCodeSchema = z.object({
  content: z.string().min(1),
  changelog: z.string().optional(),
});

export const forkCodeSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  modifications: z.string().optional(),
});

// Issue validation schemas
export const createIssueSchema = z.object({
  codeId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(10000),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  bounty: z.object({
    amount: z.string().min(1),
    token: z.string().min(1),
    isNative: z.boolean(),
  }),
});

export const submitSolutionSchema = z.object({
  codeHash: z.string().min(1),
  ipfsHash: z.string().min(1),
  description: z.string().optional(),
});

// Project validation schemas
export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(5000).optional(),
  invitees: z.array(z.string().regex(/^0x[a-fA-F0-9]{40}$/)).optional(),
});

export const inviteMemberSchema = z.object({
  invitee: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  role: z.enum(['admin', 'maintainer', 'reviewer', 'contributor', 'viewer']).optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  assignee: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  dependencies: z.array(z.string()).optional(),
});

export const updateTaskSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'review', 'done']),
});

export const createProposalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  expiresInHours: z.number().min(1).max(168).optional(),
});

export const voteProposalSchema = z.object({
  vote: z.boolean(),
});

// Auth validation schemas
export const challengeSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export const verifySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  signature: z.string().min(1),
  challenge: z.string().min(1),
});