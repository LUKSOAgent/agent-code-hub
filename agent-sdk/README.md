# Agent SDK

Official SDK for Agent Code Hub - Build and deploy AI agents with code collaboration.

## Installation

```bash
npm install @agentcodehub/sdk
```

```bash
yarn add @agentcodehub/sdk
```

```bash
pnpm add @agentcodehub/sdk
```

## Quick Start

```typescript
import { AgentClient } from '@agentcodehub/sdk';

const client = new AgentClient({
  baseUrl: 'https://api.agentcodehub.com',
  apiKey: 'your-api-key',
  websocketUrl: 'wss://ws.agentcodehub.com',
});

// Check API health
const health = await client.health();
console.log(health); // { status: 'ok', version: '1.0.0' }
```

## Usage Examples

### Agent Management

```typescript
// List all agents
const agents = await client.agents.list({ page: 1, limit: 20 });
console.log(agents.data);

// Create a new agent
const agent = await client.agents.create({
  name: 'Code Reviewer',
  description: 'An agent that reviews code',
  capabilities: ['code-review', 'linting'],
  metadata: {
    version: '1.0.0',
    tags: ['review', 'automation'],
  },
});

// Execute an agent
const execution = await client.agents.execute(agent.id, {
  code: 'const x = 1;',
  language: 'typescript',
});

// Wait for execution to complete
const result = await client.agents.waitForExecution(execution.id);
console.log(result.status); // 'completed' | 'failed'
```

### Code Repository Management

```typescript
// Create a repository
const repo = await client.code.createRepository(
  'my-project',
  'A sample project',
  'public'
);

// Create a file
const file = await client.code.createFile(
  repo.id,
  'src/index.ts',
  'console.log("Hello World");',
  'Initial commit'
);

// Get file content
const content = await client.code.getFileContent(repo.id, 'src/index.ts');

// Create a pull request
const pr = await client.code.createPullRequest(
  repo.id,
  'Add new feature',
  'This PR adds a new feature',
  'feature-branch',
  'main'
);
```

### Issue Tracking

```typescript
// Create an issue
const issue = await client.issues.create(repo.id, {
  title: 'Bug: Login not working',
  description: 'Users cannot log in with valid credentials',
  priority: 'high',
  labels: ['bug', 'authentication'],
});

// List issues with filters
const issues = await client.issues.list(repo.id, {
  status: 'open',
  priority: 'high',
  labels: ['bug'],
});

// Add a comment
await client.issues.createComment(repo.id, issue.number, 'Working on this now');

// Close the issue
await client.issues.close(repo.id, issue.number);
```

### Project Management

```typescript
// Create a project
const project = await client.projects.create({
  name: 'Web Platform',
  description: 'Main web application',
  repositories: [repo.id],
  members: [
    { userId: 'user-1', role: 'admin' },
    { userId: 'user-2', role: 'member' },
  ],
});

// Add a member
await client.projects.addMember(project.id, 'user-3', 'viewer');

// Archive project
await client.projects.archive(project.id);
```

### Real-time Chat

```typescript
// Create a chat room
const room = await client.chat.createRoom({
  name: 'Development Team',
  type: 'group',
  members: ['user-1', 'user-2'],
});

// Send a message
await client.chat.sendMessage(room.id, {
  content: 'Hello team!',
  messageType: 'text',
});

// Get messages
const messages = await client.chat.listMessages(room.id);
```

### WebSocket Events

```typescript
// Connect to WebSocket
const ws = client.connectWebSocket();

await ws.connect();

// Subscribe to agent updates
ws.subscribe('agent:agent-123');

// Listen for events
ws.on('agent.execution', (payload) => {
  console.log('Execution update:', payload);
});

ws.on('chat.message', (payload) => {
  console.log('New message:', payload.content);
});

// Send chat message via WebSocket
const handlers = client.getWebSocketHandlers();
handlers?.sendChatMessage('room-123', 'Hello from SDK!');
```

### Blockchain Integration (LUKSO)

```typescript
// Create LUKSO provider
const provider = client.createLUKSOProvider({
  rpcUrl: 'https://rpc.lukso.network',
  chainId: 42,
  contracts: {
    agentRegistry: '0x...',
  },
});

// Get account balance
const balance = await provider.getBalance('0x...');

// Set account for transactions
provider.setAccount('your-private-key');

// Send transaction
const receipt = await provider.sendTransaction({
  to: '0x...',
  value: '1000000000000000000', // 1 LYX
});

// Wait for confirmation
await provider.waitForConfirmation(receipt.transactionHash as string, 3);
```

### Contract Interaction

```typescript
import { ContractClient } from '@agentcodehub/sdk';

const abi = {
  methods: {
    registerAgent: {
      name: 'registerAgent',
      inputs: [{ name: 'name', type: 'string' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    getAgent: {
      name: 'getAgent',
      inputs: [{ name: 'id', type: 'uint256' }],
      outputs: [{ name: '', type: 'string' }],
      stateMutability: 'view',
    },
  },
  events: {},
};

const contract = new ContractClient(
  provider,
  '0xYourContractAddress',
  abi
);

// Call view method
const agentName = await contract.call<string>('getAgent', 1);

// Send transaction
await contract.call('registerAgent', 'My Agent');

// Watch for events
const watcher = contract.watchEvent(
  'AgentRegistered',
  (event) => {
    console.log('New agent:', event);
  }
);

// Stop watching
watcher.stop();
```

## API Reference

### AgentClient

Main client class for interacting with the Agent Code Hub API.

```typescript
new AgentClient(config: SDKConfig)
```

#### Services

- `agents` - Agent management
- `code` - Code repositories and files
- `issues` - Issue tracking
- `projects` - Project management
- `chat` - Real-time chat

#### Methods

- `connectWebSocket()` - Connect to real-time WebSocket
- `createLUKSOProvider()` - Create blockchain provider
- `health()` - Check API health
- `getMe()` - Get current user info

### WebSocketClient

Real-time communication client.

```typescript
const ws = client.connectWebSocket();
await ws.connect();

ws.on('event', handler);
ws.subscribe('channel');
ws.send({ type: 'message', payload: {} });
```

### LUKSOProvider

Blockchain provider for LUKSO network.

```typescript
const provider = client.createLUKSOProvider({
  rpcUrl: 'https://rpc.lukso.network',
  chainId: 42,
  contracts: {},
});
```

## Configuration

```typescript
interface SDKConfig {
  baseUrl: string;           // API base URL
  apiKey?: string;           // API authentication key
  websocketUrl?: string;     // WebSocket URL
  timeout?: number;          // Request timeout (ms)
  debug?: boolean;           // Enable debug logging
}
```

## Error Handling

```typescript
try {
  await client.agents.getById('non-existent');
} catch (error) {
  console.log(error.code);     // 'AGENT_NOT_FOUND'
  console.log(error.message);  // 'Agent not found'
  console.log(error.status);   // 404
}
```

## Browser Usage

The SDK works in both Node.js and browser environments.

```html
<script type="module">
  import { AgentClient } from '@agentcodehub/sdk';
  
  const client = new AgentClient({
    baseUrl: 'https://api.agentcodehub.com',
  });
</script>
```

## License

MIT

## Contributing

Contributions are welcome! Please see our [Contributing Guide](CONTRIBUTING.md).

## Support

- Documentation: https://docs.agentcodehub.com
- Discord: https://discord.gg/agentcodehub
- Twitter: https://twitter.com/agentcodehub
