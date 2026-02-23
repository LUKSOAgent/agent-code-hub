export interface CodeRepository {
  id: string;
  name: string;
  description?: string;
  owner: string;
  visibility: 'public' | 'private';
  defaultBranch: string;
  url: string;
  stars: number;
  forks: number;
  createdAt: string;
  updatedAt: string;
}

export interface CodeFile {
  id: string;
  repositoryId: string;
  path: string;
  name: string;
  content: string;
  language: string;
  size: number;
  sha: string;
  lastModified: string;
}

export interface CodeSnippet {
  id: string;
  title: string;
  description?: string;
  code: string;
  language: string;
  tags?: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface CodeReview {
  id: string;
  repositoryId: string;
  pullRequestId: string;
  reviewer: string;
  status: ReviewStatus;
  comments: ReviewComment[];
  submittedAt?: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'changes_requested' | 'commented';

export interface ReviewComment {
  id: string;
  filePath?: string;
  lineNumber?: number;
  content: string;
  author: string;
  createdAt: string;
}

export interface CodeDiff {
  oldPath: string;
  newPath: string;
  oldContent?: string;
  newContent?: string;
  additions: number;
  deletions: number;
  hunks: DiffHunk[];
}

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  content: string;
  lines: DiffLine[];
}

export interface DiffLine {
  type: 'addition' | 'deletion' | 'context';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface LanguageStats {
  language: string;
  files: number;
  lines: number;
  percentage: number;
}
