import { useState, useCallback, useRef } from 'react';

interface OptimisticUpdateOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error, rollbackData: T) => void;
  rollbackDelay?: number; // Delay before rollback in milliseconds
}

interface OptimisticUpdateState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isOptimistic: boolean;
}

interface UpdateOperation<T> {
  id: string;
  originalData: T | null;
  optimisticData: T;
  rollbackTimer?: NodeJS.Timeout;
}

/**
 * Hook for managing optimistic updates with rollback capabilities
 * Provides immediate UI updates with ability to rollback on failure
 */
export function useOptimisticUpdate<T>(
  options: OptimisticUpdateOptions<T> = {}
) {
  const {
    initialData = null,
    onSuccess,
    onError,
    rollbackDelay = 5000, // Default: 5 seconds rollback delay
  } = options;

  const [state, setState] = useState<OptimisticUpdateState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
    isOptimistic: false,
  });

  const operationsRef = useRef<Map<string, UpdateOperation<T>>>(new Map());

  const generateOperationId = useCallback(() => {
    return `${Date.now()}-${Math.random()}`;
  }, []);

  const startOptimisticUpdate = useCallback((
    optimisticData: T,
    operationId?: string
  ): string => {
    const id = operationId || generateOperationId();
    
    // Store the original data and set up the operation
    const operation: UpdateOperation<T> = {
      id,
      originalData: state.data,
      optimisticData,
    };
    
    operationsRef.current.set(id, operation);

    // Update state with optimistic data
    setState(prevState => ({
      ...prevState,
      data: optimisticData,
      isOptimistic: true,
      error: null,
    }));

    return id;
  }, [state.data, generateOperationId]);

  const confirmOptimisticUpdate = useCallback((
    operationId: string,
    finalData?: T
  ) => {
    const operation = operationsRef.current.get(operationId);
    if (!operation) {
      return;
    }

    // Clear rollback timer if it exists
    if (operation.rollbackTimer) {
      clearTimeout(operation.rollbackTimer);
    }

    // Remove the operation
    operationsRef.current.delete(operationId);

    // Update state with final data
    setState(prevState => ({
      ...prevState,
      data: finalData || operation.optimisticData,
      isOptimistic: operationsRef.current.size > 0,
      error: null,
    }));

    // Call success callback
    if (onSuccess) {
      onSuccess(finalData || operation.optimisticData);
    }
  }, [onSuccess]);

  const rollbackOptimisticUpdate = useCallback((
    operationId: string,
    error?: Error
  ) => {
    const operation = operationsRef.current.get(operationId);
    if (!operation) {
      return;
    }

    // Clear rollback timer if it exists
    if (operation.rollbackTimer) {
      clearTimeout(operation.rollbackTimer);
    }

    // Remove the operation
    operationsRef.current.delete(operationId);

    // Rollback to original data
    setState(prevState => ({
      ...prevState,
      data: operation.originalData,
      isOptimistic: operationsRef.current.size > 0,
      error: error || null,
    }));

    // Call error callback
    if (onError && error) {
      onError(error, operation.originalData);
    }
  }, [onError]);

  const executeOptimisticUpdate = useCallback(async <R>(
    optimisticData: T,
    asyncOperation: () => Promise<R>,
    options: {
      operationId?: string;
      autoRollback?: boolean;
      rollbackDelay?: number;
    } = {}
  ): Promise<R> => {
    const {
      operationId,
      autoRollback = true,
      rollbackDelay: operationRollbackDelay = rollbackDelay,
    } = options;

    // Start optimistic update
    const id = startOptimisticUpdate(optimisticData, operationId);

    // Set up automatic rollback if enabled
    if (autoRollback) {
      const operation = operationsRef.current.get(id);
      if (operation) {
        operation.rollbackTimer = setTimeout(() => {
          rollbackOptimisticUpdate(id, new Error('Operation timed out'));
        }, operationRollbackDelay);
        operationsRef.current.set(id, operation);
      }
    }

    try {
      setState(prevState => ({
        ...prevState,
        isLoading: true,
      }));

      const result = await asyncOperation();

      // Confirm the optimistic update
      confirmOptimisticUpdate(id);

      setState(prevState => ({
        ...prevState,
        isLoading: false,
      }));

      return result;
    } catch (error) {
      // Rollback the optimistic update
      rollbackOptimisticUpdate(id, error as Error);

      setState(prevState => ({
        ...prevState,
        isLoading: false,
      }));

      throw error;
    }
  }, [
    startOptimisticUpdate,
    confirmOptimisticUpdate,
    rollbackOptimisticUpdate,
    rollbackDelay,
  ]);

  const clearAllOptimisticUpdates = useCallback(() => {
    // Clear all rollback timers
    operationsRef.current.forEach(operation => {
      if (operation.rollbackTimer) {
        clearTimeout(operation.rollbackTimer);
      }
    });

    // Find the oldest original data to rollback to
    let oldestOriginalData: T | null = null;
    operationsRef.current.forEach(operation => {
      if (oldestOriginalData === null) {
        oldestOriginalData = operation.originalData;
      }
    });

    // Clear all operations
    operationsRef.current.clear();

    // Reset state
    setState(prevState => ({
      ...prevState,
      data: oldestOriginalData,
      isOptimistic: false,
      error: null,
    }));
  }, []);

  const updateData = useCallback((newData: T) => {
    setState(prevState => ({
      ...prevState,
      data: newData,
      isOptimistic: false,
      error: null,
    }));
  }, []);

  const setError = useCallback((error: Error | null) => {
    setState(prevState => ({
      ...prevState,
      error,
    }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prevState => ({
      ...prevState,
      isLoading,
    }));
  }, []);

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    isOptimistic: state.isOptimistic,
    startOptimisticUpdate,
    confirmOptimisticUpdate,
    rollbackOptimisticUpdate,
    executeOptimisticUpdate,
    clearAllOptimisticUpdates,
    updateData,
    setError,
    setLoading,
  };
}

/**
 * Specialized hook for subscription optimistic updates
 */
export function useSubscriptionOptimisticUpdate() {
  return useOptimisticUpdate<any>({
    rollbackDelay: 10000, // 10 seconds for subscription operations
  });
}

/**
 * Specialized hook for payment optimistic updates
 */
export function usePaymentOptimisticUpdate() {
  return useOptimisticUpdate<any>({
    rollbackDelay: 15000, // 15 seconds for payment operations
  });
}