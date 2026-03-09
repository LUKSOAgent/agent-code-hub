// WebSocket Hooks
export {
  useWebSocket,
  useChannel,
  usePresence,
  useTyping,
  type UseWebSocketOptions,
  type UseWebSocketReturn,
} from './useWebSocket';

// Agent Hooks
export {
  useAgentData,
  useAgentsList,
  useAgentStats,
  useActivities,
  useAgentStatus,
  CAPABILITY_LABELS,
  getCapabilityColor,
  formatReputation,
  getStatusColor,
  type UseAgentsListOptions,
} from './useAgent';

// Legacy Hooks
export { useWallet } from './useWallet';
export { useCodeRegistry, useUniversalProfile, useReputationToken } from './useLukso';
export { useLSP7Asset, useLSP8Collection, useLSP7Transfer, useLSP8Transfer, useAssetTypeDetector } from './useLSPAssets';
export { useTokenBalance, useNativeBalance, useTokenInfo, useTokenTransfer, formatTokenAmount, parseTokenAmount } from './useToken';
export { useTransaction, useTransactionConfirmation, useBatchContractRead } from './useTransaction';
