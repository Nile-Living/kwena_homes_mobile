import { useState, useRef, useCallback } from 'react';

interface RequestState {
  isLoading: boolean;
  lastRequestTime: number;
  requestId: string | null;
}

interface UseRequestDeduplicationOptions {
  minIntervalMs?: number; // Minimum time between requests in milliseconds
  deduplicateByParams?: boolean; // Whether to deduplicate based on parameters
}

interface RequestOptions {
  requestId?: string;
  params?: any;
  forceRequest?: boolean; // Force request even if there's an ongoing one
}

/**
 * Hook for handling request deduplication and loading states
 * Prevents duplicate requests and provides loading state management
 */
export function useRequestDeduplication<T>(
  options: UseRequestDeduplicationOptions = {}
) {
  const {
    minIntervalMs = 1000, // Default: 1 second between requests
    deduplicateByParams = false,
  } = options;

  const [state, setState] = useState<RequestState>({
    isLoading: false,
    lastRequestTime: 0,
    requestId: null,
  });

  const activeRequests = useRef<Map<string, Promise<T>>>(new Map());
  const lastParamsRef = useRef<any>(null);

  const generateRequestId = useCallback((params?: any): string => {
    if (deduplicateByParams && params) {
      return `${Date.now()}-${JSON.stringify(params)}`;
    }
    return `${Date.now()}-${Math.random()}`;
  }, [deduplicateByParams]);

  const shouldSkipRequest = useCallback((
    requestId: string,
    params?: any,
    forceRequest?: boolean
  ): boolean => {
    if (forceRequest) {
      return false;
    }

    // Check if we're within the minimum interval
    const now = Date.now();
    const timeSinceLastRequest = now - state.lastRequestTime;
    if (timeSinceLastRequest < minIntervalMs) {
      return true;
    }

    // Check if there's an ongoing request with the same parameters
    if (deduplicateByParams && params) {
      const currentParamsString = JSON.stringify(params);
      const lastParamsString = JSON.stringify(lastParamsRef.current);
      
      if (currentParamsString === lastParamsString && state.isLoading) {
        return true;
      }
    }

    // Check if there's an active request with the same ID
    return activeRequests.current.has(requestId);
  }, [minIntervalMs, deduplicateByParams, state.isLoading, state.lastRequestTime]);

  const executeRequest = useCallback(async <R extends T>(
    requestFunction: () => Promise<R>,
    requestOptions: RequestOptions = {}
  ): Promise<R> => {
    const {
      requestId: providedRequestId,
      params,
      forceRequest = false,
    } = requestOptions;

    const requestId = providedRequestId || generateRequestId(params);

    // Check if we should skip this request
    if (shouldSkipRequest(requestId, params, forceRequest)) {
      // If there's an active request with the same ID, wait for it
      const activeRequest = activeRequests.current.get(requestId);
      if (activeRequest) {
        return activeRequest as Promise<R>;
      }
      
      // Otherwise, skip the request
      throw new Error('Request skipped due to deduplication');
    }

    // Update state to indicate request is starting
    setState(prevState => ({
      ...prevState,
      isLoading: true,
      lastRequestTime: Date.now(),
      requestId,
    }));

    // Store last parameters for deduplication
    if (deduplicateByParams && params) {
      lastParamsRef.current = params;
    }

    // Create and store the request promise
    const requestPromise = requestFunction();
    activeRequests.current.set(requestId, requestPromise as Promise<T>);

    try {
      const result = await requestPromise;
      
      // Update state to indicate request completed successfully
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        requestId: null,
      }));

      return result;
    } catch (error) {
      // Update state to indicate request failed
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        requestId: null,
      }));

      throw error;
    } finally {
      // Clean up the active request
      activeRequests.current.delete(requestId);
    }
  }, [generateRequestId, shouldSkipRequest, deduplicateByParams]);

  const cancelRequest = useCallback((requestId: string) => {
    activeRequests.current.delete(requestId);
    
    setState(prevState => {
      if (prevState.requestId === requestId) {
        return {
          ...prevState,
          isLoading: false,
          requestId: null,
        };
      }
      return prevState;
    });
  }, []);

  const cancelAllRequests = useCallback(() => {
    activeRequests.current.clear();
    setState(prevState => ({
      ...prevState,
      isLoading: false,
      requestId: null,
    }));
  }, []);

  const isRequestActive = useCallback((requestId: string): boolean => {
    return activeRequests.current.has(requestId);
  }, []);

  return {
    isLoading: state.isLoading,
    lastRequestTime: state.lastRequestTime,
    currentRequestId: state.requestId,
    executeRequest,
    cancelRequest,
    cancelAllRequests,
    isRequestActive,
  };
}

/**
 * Specialized hook for payment requests with built-in deduplication
 */
export function usePaymentRequestDeduplication() {
  return useRequestDeduplication<any>({
    minIntervalMs: 2000, // 2 seconds between payment requests
    deduplicateByParams: true,
  });
}

/**
 * Specialized hook for subscription requests with built-in deduplication
 */
export function useSubscriptionRequestDeduplication() {
  return useRequestDeduplication<any>({
    minIntervalMs: 3000, // 3 seconds between subscription requests
    deduplicateByParams: true,
  });
}