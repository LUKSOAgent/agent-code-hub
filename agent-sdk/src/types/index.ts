export * from './agent';
export * from './code';
export * from './issue';
export * from './websocket';

export interface SDKConfig {
  baseUrl: string;
  apiKey?: string;
  websocketUrl?: string;
  timeout?: number;
  debug?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  status: number;
}

export interface BlockchainConfig {
  rpcUrl: string;
  chainId: number;
  contracts: {
    agentRegistry?: string;
    codeHub?: string;
    governance?: string;
  };
}
