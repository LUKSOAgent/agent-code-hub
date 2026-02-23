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
export { useLukso } from './useLukso';
export { useLSPAssets } from './useLSPAssets';
export { useToken } from './useToken';
export { useTransaction } from './useTransaction';
