import { useState, useCallback, useEffect } from 'react';
import { useWeb3, Web3Error } from '../contexts/Web3Context';
import { Hex, TransactionReceipt } from 'viem';

export interface TransactionOptions {
  onSuccess?: (hash: string, receipt?: TransactionReceipt) => void;
  onError?: (error: Web3Error) => void;
  onConfirm?: (confirmations: number) => void;
  confirmations?: number;
}

export interface UseTransactionReturn {
  hash: string | null;
  status: 'idle' | 'pending' | 'success' | 'failed';
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  receipt: TransactionReceipt | null;
  confirmations: number;
  execute: (
    contractAddress: string,
    abi: any,
    functionName: string,
    args: any[],
    value?: bigint,
    options?: TransactionOptions
  ) => Promise<string>;
  reset: () => void;
  waitForConfirmation: (hash: string, confirmations?: number) => Promise<TransactionReceipt>;
}

/**
 * Hook for managing individual transactions with full state tracking
 */
export function useTransaction(): UseTransactionReturn {
  const { executeTransaction, publicClient } = useWeb3();
  
  const [state, setState] = useState<{
    hash: string | null;
    status: 'idle' | 'pending' | 'success' | 'failed';
    error: string | null;
    receipt: TransactionReceipt | null;
    confirmations: number;
  }>({
    hash: null,
    status: 'idle',
    error: null,
    receipt: null,
    confirmations: 0,
  });

  const reset = useCallback(() => {
    setState({
      hash: null,
      status: 'idle',
      error: null,
      receipt: null,
      confirmations: 0,
    });
  }, []);

  const waitForConfirmation = useCallback(async (
    hash: string,
    confirmations: number = 1
  ): Promise<TransactionReceipt> => {
    if (!publicClient) {
      throw new Web3Error('Public client not available', 'CLIENT_UNAVAILABLE');
    }

    try {
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: hash as Hex,
        confirmations,
      });
      
      setState(prev => ({
        ...prev,
        receipt,
        confirmations,
        status: receipt.status === 'success' ? 'success' : 'failed',
      }));
      
      return receipt;
    } catch (error: any) {
      throw new Web3Error(
        error?.message || 'Failed to confirm transaction',
        'CONFIRMATION_FAILED',
        error
      );
    }
  }, [publicClient]);

  const execute = useCallback(async (
    contractAddress: string,
    abi: any,
    functionName: string,
    args: any[],
    value: bigint = 0n,
    options?: TransactionOptions
  ): Promise<string> => {
    reset();
    
    try {
      setState(prev => ({ ...prev, status: 'pending' }));
      
      const hash = await executeTransaction(contractAddress, abi, functionName, args, value);
      
      setState(prev => ({
        ...prev,
        hash,
        status: 'pending',
      }));

      options?.onSuccess?.(hash);

      // Wait for confirmation if specified
      if (options?.confirmations && options.confirmations > 0) {
        const receipt = await waitForConfirmation(hash, options.confirmations);
        
        if (receipt.status === 'success') {
          setState(prev => ({
            ...prev,
            status: 'success',
            receipt,
            confirmations: options.confirmations || 1,
          }));
          options?.onSuccess?.(hash, receipt);
        } else {
          throw new Web3Error('Transaction failed on-chain', 'TRANSACTION_FAILED');
        }
      } else {
        setState(prev => ({ ...prev, status: 'success' }));
        options?.onSuccess?.(hash);
      }

      return hash;
    } catch (error: any) {
      const web3Error = error instanceof Web3Error 
        ? error 
        : new Web3Error(error?.message || 'Transaction failed', 'UNKNOWN_ERROR', error);
      
      setState(prev => ({
        ...prev,
        status: 'failed',
        error: web3Error.message,
      }));
      
      options?.onError?.(web3Error);
      throw web3Error;
    }
  }, [executeTransaction, reset, waitForConfirmation]);

  return {
    hash: state.hash,
    status: state.status,
    error: state.error,
    isLoading: state.status === 'pending',
    isSuccess: state.status === 'success',
    isError: state.status === 'failed',
    receipt: state.receipt,
    confirmations: state.confirmations,
    execute,
    reset,
    waitForConfirmation,
  };
}

/**
 * Hook for tracking transaction confirmation status
 */
export function useTransactionConfirmation(hash: string | null, confirmations: number = 1) {
  const { publicClient } = useWeb3();
  
  const [state, setState] = useState<{
    status: 'idle' | 'pending' | 'success' | 'failed';
    receipt: TransactionReceipt | null;
    currentConfirmations: number;
    error: string | null;
  }>({
    status: 'idle',
    receipt: null,
    currentConfirmations: 0,
    error: null,
  });

  useEffect(() => {
    if (!hash || !publicClient) return;

    let isSubscribed = true;

    async function checkConfirmation() {
      try {
        setState(prev => ({ ...prev, status: 'pending' }));
        
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: hash as Hex,
          confirmations,
        });

        if (!isSubscribed) return;

        setState({
          status: receipt.status === 'success' ? 'success' : 'failed',
          receipt,
          currentConfirmations: confirmations,
          error: null,
        });
      } catch (error: any) {
        if (!isSubscribed) return;
        
        setState(prev => ({
          ...prev,
          status: 'failed',
          error: error?.message || 'Failed to confirm transaction',
        }));
      }
    }

    checkConfirmation();

    return () => {
      isSubscribed = false;
    };
  }, [hash, confirmations, publicClient]);

  return {
    ...state,
    isLoading: state.status === 'pending',
    isConfirmed: state.status === 'success',
  };
}

/**
 * Hook for batching multiple read calls efficiently
 */
export function useBatchContractRead() {
  const { publicClient } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const batchRead = useCallback(async <T = any,>(
    calls: Array<{
      address: string;
      abi: any;
      functionName: string;
      args?: any[];
    }>
  ): Promise<T[]> => {
    if (!publicClient) {
      throw new Web3Error('Public client not available', 'CLIENT_UNAVAILABLE');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use multicall if available, otherwise parallel promises
      const results = await Promise.all(
        calls.map(async (call) => {
          try {
            return await publicClient.readContract({
              address: call.address as Hex,
              abi: call.abi,
              functionName: call.functionName,
              args: call.args || [],
            });
          } catch (err) {
            console.error(`Error reading ${call.functionName}:`, err);
            return null;
          }
        })
      );

      return results as T[];
    } catch (err: any) {
      const message = err?.message || 'Batch read failed';
      setError(message);
      throw new Web3Error(message, 'BATCH_READ_FAILED', err);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient]);

  return { batchRead, isLoading, error };
}
