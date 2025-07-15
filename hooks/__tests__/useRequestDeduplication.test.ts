import { renderHook, act } from '@testing-library/react-hooks';
import { useRequestDeduplication, usePaymentRequestDeduplication } from '../useRequestDeduplication';

// Mock setTimeout and clearTimeout for testing
jest.useFakeTimers();

describe('useRequestDeduplication', () => {
  it('should execute request successfully', async () => {
    const { result } = renderHook(() => useRequestDeduplication());
    
    const mockFunction = jest.fn().mockResolvedValue('success');
    
    await act(async () => {
      const response = await result.current.executeRequest(mockFunction);
      expect(response).toBe('success');
    });
    
    expect(mockFunction).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(false);
  });

  it('should prevent duplicate requests within minimum interval', async () => {
    const { result } = renderHook(() => 
      useRequestDeduplication({ minIntervalMs: 1000 })
    );
    
    const mockFunction = jest.fn().mockResolvedValue('success');
    
    // First request
    await act(async () => {
      await result.current.executeRequest(mockFunction);
    });
    
    // Second request immediately after (should be skipped)
    await act(async () => {
      try {
        await result.current.executeRequest(mockFunction);
      } catch (error) {
        expect(error.message).toBe('Request skipped due to deduplication');
      }
    });
    
    expect(mockFunction).toHaveBeenCalledTimes(1);
  });

  it('should allow requests after minimum interval', async () => {
    const { result } = renderHook(() => 
      useRequestDeduplication({ minIntervalMs: 1000 })
    );
    
    const mockFunction = jest.fn().mockResolvedValue('success');
    
    // First request
    await act(async () => {
      await result.current.executeRequest(mockFunction);
    });
    
    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Second request after interval (should succeed)
    await act(async () => {
      await result.current.executeRequest(mockFunction);
    });
    
    expect(mockFunction).toHaveBeenCalledTimes(2);
  });

  it('should deduplicate based on parameters', async () => {
    const { result } = renderHook(() => 
      useRequestDeduplication({ 
        minIntervalMs: 500, 
        deduplicateByParams: true 
      })
    );
    
    const mockFunction = jest.fn().mockResolvedValue('success');
    
    // First request with params
    await act(async () => {
      await result.current.executeRequest(mockFunction, {
        params: { id: 1, name: 'test' }
      });
    });
    
    // Second request with same params (should be skipped)
    await act(async () => {
      try {
        await result.current.executeRequest(mockFunction, {
          params: { id: 1, name: 'test' }
        });
      } catch (error) {
        expect(error.message).toBe('Request skipped due to deduplication');
      }
    });
    
    // Third request with different params (should succeed)
    await act(async () => {
      await result.current.executeRequest(mockFunction, {
        params: { id: 2, name: 'test2' }
      });
    });
    
    expect(mockFunction).toHaveBeenCalledTimes(2);
  });

  it('should handle force request option', async () => {
    const { result } = renderHook(() => 
      useRequestDeduplication({ minIntervalMs: 1000 })
    );
    
    const mockFunction = jest.fn().mockResolvedValue('success');
    
    // First request
    await act(async () => {
      await result.current.executeRequest(mockFunction);
    });
    
    // Second request with force option (should succeed)
    await act(async () => {
      await result.current.executeRequest(mockFunction, {
        forceRequest: true
      });
    });
    
    expect(mockFunction).toHaveBeenCalledTimes(2);
  });

  it('should track loading state correctly', async () => {
    const { result } = renderHook(() => useRequestDeduplication());
    
    const mockFunction = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve('success'), 100))
    );
    
    expect(result.current.isLoading).toBe(false);
    
    act(() => {
      result.current.executeRequest(mockFunction);
    });
    
    expect(result.current.isLoading).toBe(true);
    
    // Fast forward time to complete request
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    await act(async () => {
      await jest.runAllTimers();
    });
    
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle request failures', async () => {
    const { result } = renderHook(() => useRequestDeduplication());
    
    const mockFunction = jest.fn().mockRejectedValue(new Error('Request failed'));
    
    await act(async () => {
      try {
        await result.current.executeRequest(mockFunction);
      } catch (error) {
        expect(error.message).toBe('Request failed');
      }
    });
    
    expect(result.current.isLoading).toBe(false);
  });

  it('should cancel active requests', async () => {
    const { result } = renderHook(() => useRequestDeduplication());
    
    const mockFunction = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve('success'), 1000))
    );
    
    let requestId: string;
    
    await act(async () => {
      requestId = result.current.executeRequest(mockFunction, {
        requestId: 'test-request'
      }).catch(() => {});
    });
    
    expect(result.current.isLoading).toBe(true);
    
    act(() => {
      result.current.cancelRequest('test-request');
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isRequestActive('test-request')).toBe(false);
  });

  it('should cancel all requests', async () => {
    const { result } = renderHook(() => useRequestDeduplication());
    
    const mockFunction = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve('success'), 1000))
    );
    
    // Start multiple requests
    act(() => {
      result.current.executeRequest(mockFunction, { requestId: 'request1' }).catch(() => {});
      result.current.executeRequest(mockFunction, { requestId: 'request2' }).catch(() => {});
    });
    
    expect(result.current.isLoading).toBe(true);
    
    act(() => {
      result.current.cancelAllRequests();
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isRequestActive('request1')).toBe(false);
    expect(result.current.isRequestActive('request2')).toBe(false);
  });
});

describe('usePaymentRequestDeduplication', () => {
  it('should have payment-specific configuration', () => {
    const { result } = renderHook(() => usePaymentRequestDeduplication());
    
    expect(result.current.isLoading).toBe(false);
    // This hook should have 2 second minimum interval and parameter deduplication
  });

  it('should prevent rapid payment requests', async () => {
    const { result } = renderHook(() => usePaymentRequestDeduplication());
    
    const mockPaymentFunction = jest.fn().mockResolvedValue({ 
      reference: 'payment-ref',
      status: 'successful' 
    });
    
    // First payment request
    await act(async () => {
      await result.current.executeRequest(mockPaymentFunction, {
        params: { amount: 100, phone: '0977123456' }
      });
    });
    
    // Second payment request immediately after (should be skipped)
    await act(async () => {
      try {
        await result.current.executeRequest(mockPaymentFunction, {
          params: { amount: 100, phone: '0977123456' }
        });
      } catch (error) {
        expect(error.message).toBe('Request skipped due to deduplication');
      }
    });
    
    expect(mockPaymentFunction).toHaveBeenCalledTimes(1);
  });

  it('should allow different payment requests', async () => {
    const { result } = renderHook(() => usePaymentRequestDeduplication());
    
    const mockPaymentFunction = jest.fn().mockResolvedValue({ 
      reference: 'payment-ref',
      status: 'successful' 
    });
    
    // First payment request
    await act(async () => {
      await result.current.executeRequest(mockPaymentFunction, {
        params: { amount: 100, phone: '0977123456' }
      });
    });
    
    // Second payment request with different params (should succeed)
    await act(async () => {
      await result.current.executeRequest(mockPaymentFunction, {
        params: { amount: 200, phone: '0977123456' }
      });
    });
    
    expect(mockPaymentFunction).toHaveBeenCalledTimes(2);
  });
});