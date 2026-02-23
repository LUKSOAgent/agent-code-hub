import type { LUKSOProvider } from './LUKSOProvider';

export interface ContractMethod {
  name: string;
  inputs: { name: string; type: string }[];
  outputs: { name: string; type: string }[];
  stateMutability: 'view' | 'pure' | 'nonpayable' | 'payable';
}

export interface ContractEvent {
  name: string;
  inputs: { name: string; type: string; indexed: boolean }[];
}

export interface ContractABI {
  methods: Record<string, ContractMethod>;
  events: Record<string, ContractEvent>;
}

export class ContractClient {
  private provider: LUKSOProvider;
  private address: string;
  private abi: ContractABI;
  private contract: Record<string, (...args: unknown[]) => Promise<unknown>>;

  constructor(provider: LUKSOProvider, address: string, abi: ContractABI) {
    this.provider = provider;
    this.address = address;
    this.abi = abi;
    this.contract = this.createContractInstance();
  }

  private createContractInstance(): Record<string, (...args: unknown[]) => Promise<unknown>> {
    const web3 = this.provider.getWeb3();
    const contract = new web3.eth.Contract([this.abi as unknown as Record<string, unknown>], this.address);

    const methods: Record<string, (...args: unknown[]) => Promise<unknown>> = {};

    for (const [name, method] of Object.entries(this.abi.methods)) {
      methods[name] = async (...args: unknown[]): Promise<unknown> => {
        const methodCall = (contract.methods as Record<string, (...args: unknown[]) => unknown>)[name](...args);

        if (method.stateMutability === 'view' || method.stateMutability === 'pure') {
          return methodCall.call();
        } else {
          const account = this.provider.getAccount();
          if (!account) {
            throw new Error('No account set for transaction');
          }
          return methodCall.send({ from: account });
        }
      };
    }

    return methods;
  }

  async call<T>(methodName: string, ...args: unknown[]): Promise<T> {
    if (!this.contract[methodName]) {
      throw new Error(`Method ${methodName} not found in contract`);
    }
    return this.contract[methodName](...args) as Promise<T>;
  }

  async estimateGas(methodName: string, ...args: unknown[]): Promise<number> {
    const web3 = this.provider.getWeb3();
    const contract = new web3.eth.Contract([this.abi as unknown as Record<string, unknown>], this.address);

    if (!contract.methods[methodName]) {
      throw new Error(`Method ${methodName} not found in contract`);
    }

    const methodCall = contract.methods[methodName](...args);
    return methodCall.estimateGas({ from: this.provider.getAccount() });
  }

  encodeMethodCall(methodName: string, ...args: unknown[]): string {
    const web3 = this.provider.getWeb3();
    const contract = new web3.eth.Contract([this.abi as unknown as Record<string, unknown>], this.address);

    if (!contract.methods[methodName]) {
      throw new Error(`Method ${methodName} not found in contract`);
    }

    return contract.methods[methodName](...args).encodeABI();
  }

  async getEvents<T>(
    eventName: string,
    options: { fromBlock?: number; toBlock?: number | 'latest'; filter?: Record<string, unknown> } = {}
  ): Promise<T[]> {
    const web3 = this.provider.getWeb3();
    const contract = new web3.eth.Contract([this.abi as unknown as Record<string, unknown>], this.address);

    const events = await contract.getPastEvents(eventName, {
      fromBlock: options.fromBlock || 0,
      toBlock: options.toBlock || 'latest',
      filter: options.filter,
    });

    return events as T[];
  }

  async getTransactionReceipt(txHash: string): Promise<Record<string, unknown> | null> {
    return this.provider.getTransactionReceipt(txHash);
  }

  getAddress(): string {
    return this.address;
  }

  getABI(): ContractABI {
    return this.abi;
  }

  watchEvent<T>(
    eventName: string,
    callback: (event: T) => void,
    options: { fromBlock?: number; filter?: Record<string, unknown> } = {}
  ): { stop: () => void } {
    const web3 = this.provider.getWeb3();
    const contract = new web3.eth.Contract([this.abi as unknown as Record<string, unknown>], this.address);

    const eventEmitter = contract.events[eventName]({
      fromBlock: options.fromBlock || 'latest',
      filter: options.filter,
    });

    eventEmitter.on('data', callback);

    return {
      stop: () => {
        eventEmitter.removeAllListeners();
      },
    };
  }
}
