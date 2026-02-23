import { Web3 } from 'web3';
import type { BlockchainConfig } from '../types';

export class LUKSOProvider {
  private web3: Web3;
  private config: BlockchainConfig;
  private account?: string;

  constructor(config: BlockchainConfig) {
    this.config = config;
    this.web3 = new Web3(config.rpcUrl);
  }

  getWeb3(): Web3 {
    return this.web3;
  }

  async getBlockNumber(): Promise<number> {
    return this.web3.eth.getBlockNumber();
  }

  async getBalance(address: string): Promise<string> {
    const balance = await this.web3.eth.getBalance(address);
    return this.web3.utils.fromWei(balance, 'ether');
  }

  async getChainId(): Promise<number> {
    if (this.config.chainId) {
      return this.config.chainId;
    }
    const chainId = await this.web3.eth.getChainId();
    return Number(chainId);
  }

  async getGasPrice(): Promise<string> {
    const gasPrice = await this.web3.eth.getGasPrice();
    return this.web3.utils.fromWei(gasPrice, 'gwei');
  }

  setAccount(privateKey: string): void {
    const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
    this.account = account.address;
    this.web3.eth.accounts.wallet.add(account);
  }

  getAccount(): string | undefined {
    return this.account;
  }

  async signMessage(message: string): Promise<string> {
    if (!this.account) {
      throw new Error('No account set. Call setAccount() first.');
    }
    const signature = await this.web3.eth.accounts.sign(message, this.account);
    return signature.signature;
  }

  async verifyMessage(message: string, signature: string, address: string): Promise<boolean> {
    try {
      const recoveredAddress = this.web3.eth.accounts.recover(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch {
      return false;
    }
  }

  async estimateGas(transaction: Record<string, unknown>): Promise<number> {
    return this.web3.eth.estimateGas(transaction);
  }

  async sendTransaction(transaction: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (!this.account) {
      throw new Error('No account set. Call setAccount() first.');
    }

    const tx = {
      from: this.account,
      ...transaction,
    };

    const signed = await this.web3.eth.accounts.signTransaction(
      tx,
      this.web3.eth.accounts.wallet[this.account].privateKey
    );

    if (!signed.rawTransaction) {
      throw new Error('Failed to sign transaction');
    }

    return this.web3.eth.sendSignedTransaction(signed.rawTransaction);
  }

  async getTransactionReceipt(txHash: string): Promise<Record<string, unknown> | null> {
    return this.web3.eth.getTransactionReceipt(txHash);
  }

  async getTransaction(txHash: string): Promise<Record<string, unknown> | null> {
    return this.web3.eth.getTransaction(txHash);
  }

  async waitForConfirmation(txHash: string, confirmations = 1): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      const checkConfirmation = async () => {
        try {
          const receipt = await this.getTransactionReceipt(txHash);
          if (receipt && (receipt as { blockNumber: number }).blockNumber) {
            const currentBlock = await this.getBlockNumber();
            const blockNumber = (receipt as { blockNumber: number }).blockNumber;
            
            if (currentBlock - blockNumber >= confirmations) {
              resolve(receipt);
              return;
            }
          }
          setTimeout(checkConfirmation, 5000);
        } catch (error) {
          reject(error);
        }
      };

      checkConfirmation();
    });
  }

  disconnect(): void {
    if (this.web3.currentProvider && typeof (this.web3.currentProvider as { disconnect?: () => void }).disconnect === 'function') {
      (this.web3.currentProvider as { disconnect: () => void }).disconnect();
    }
  }
}
