import { renderHook, act } from '@testing-library/react-hooks';
import { useOptimisticUpdate, useSubscriptionOptimisticUpdate } from '../useOptimisticUpdate';

// Mock setTimeout and clearTimeout for testing
jest.useFakeTimers();

describe('useOptimisticUpdate', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useOptimisticUpdate());
    
    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isOptimistic).toBe(false);
  });

  it('should initialize with initial data', () => {
    const initialData = { id: 1, name: 'test' };
    const { result } = renderHook(() => 
      useOptimisticUpdate({ initialData })
    );
    
    expect(result.current.data).toEqual(initialData);
  });

  it('should start optimistic update', () => {
    const { result } = renderHook(() => useOptimisticUpdate());
    
    const optimisticData = { id: 1, name: 'optimistic' };
    
    let operationId: string;
    
    act(() => {
      operationId = result.current.startOptimisticUpdate(optimisticData);
    });
    
    expect(result.current.data).toEqual(optimisticData);
    expect(result.current.isOptimistic).toBe(true);
    expect(operationId).toBeDefined();
  });

  it('should confirm optimistic update', () => {
    const { result } = renderHook(() => useOptimisticUpdate());
    
    const optimisticData = { id: 1, name: 'optimistic' };
    const finalData = { id: 1, name: 'final' };
    
    let operationId: string;
    
    act(() => {
      operationId = result.current.startOptimisticUpdate(optimisticData);
    });
    
    act(() => {
      result.current.confirmOptimisticUpdate(operationId, finalData);
    });
    
    expect(result.current.data).toEqual(finalData);
    expect(result.current.isOptimistic).toBe(false);
  });

  it('should rollback optimistic update', () => {
    const initialData = { id: 1, name: 'initial' };
    const { result } = renderHook(() => 
      useOptimisticUpdate({ initialData })
    );
    
    const optimisticData = { id: 1, name: 'optimistic' };
    const error = new Error('Update failed');
    
    let operationId: string;
    
    act(() => {
      operationId = result.current.startOptimisticUpdate(optimisticData);
    });
    
    expect(result.current.data).toEqual(optimisticData);
    
    act(() => {
      result.current.rollbackOptimisticUpdate(operationId, error);
    });
    
    expect(result.current.data).toEqual(initialData);
    expect(result.current.error).toEqual(error);
    expect(result.current.isOptimistic).toBe(false);
  });

  it('should execute optimistic update with success', async () => {
    const { result } = renderHook(() => useOptimisticUpdate());
    
    const optimisticData = { id: 1, name: 'optimistic' };
    const mockAsyncOperation = jest.fn().mockResolvedValue('success');
    
    await act(async () => {
      const response = await result.current.executeOptimisticUpdate(
        optimisticData,
        mockAsyncOperation
      );
      expect(response).toBe('success');
    });
    
    expect(result.current.data).toEqual(optimisticData);
    expect(result.current.isOptimistic).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(mockAsyncOperation).toHaveBeenCalledTimes(1);
  });

  it('should execute optimistic update with failure and rollback', async () => {
    const initialData = { id: 1, name: 'initial' };
    const { result } = renderHook(() => 
      useOptimisticUpdate({ initialData })
    );
    
    const optimisticData = { id: 1, name: 'optimistic' };
    const error = new Error('Operation failed');
    const mockAsyncOperation = jest.fn().mockRejectedValue(error);
    
    await act(async () => {
      try {
        await result.current.executeOptimisticUpdate(
          optimisticData,
          mockAsyncOperation
        );
      } catch (caught) {
        expect(caught).toBe(error);
      }
    });
    
    expect(result.current.data).toEqual(initialData);
    expect(result.current.error).toEqual(error);
    expect(result.current.isOptimistic).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle auto rollback on timeout', async () => {
    const initialData = { id: 1, name: 'initial' };
    const { result } = renderHook(() => 
      useOptimisticUpdate({ initialData, rollbackDelay: 1000 })
    );
    
    const optimisticData = { id: 1, name: 'optimistic' };
    const mockAsyncOperation = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve('success'), 2000))
    );
    
    act(() => {
      result.current.executeOptimisticUpdate(
        optimisticData,
        mockAsyncOperation,
        { autoRollback: true }
      );
    });
    
    expect(result.current.data).toEqual(optimisticData);
    expect(result.current.isOptimistic).toBe(true);
    
    // Fast forward to trigger rollback
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(result.current.data).toEqual(initialData);
    expect(result.current.error).toEqual(expect.any(Error));
    expect(result.current.isOptimistic).toBe(false);
  });

  it('should handle multiple concurrent optimistic updates', () => {
    const { result } = renderHook(() => useOptimisticUpdate());
    
    const optimisticData1 = { id: 1, name: 'optimistic1' };
    const optimisticData2 = { id: 2, name: 'optimistic2' };
    
    let operationId1: string;
    let operationId2: string;
    
    act(() => {
      operationId1 = result.current.startOptimisticUpdate(optimisticData1);
      operationId2 = result.current.startOptimisticUpdate(optimisticData2);
    });
    
    expect(result.current.data).toEqual(optimisticData2); // Latest update
    expect(result.current.isOptimistic).toBe(true);
    
    // Confirm first operation
    act(() => {
      result.current.confirmOptimisticUpdate(operationId1);
    });
    
    expect(result.current.isOptimistic).toBe(true); // Still optimistic due to second operation
    
    // Confirm second operation
    act(() => {
      result.current.confirmOptimisticUpdate(operationId2);
    });
    
    expect(result.current.isOptimistic).toBe(false); // No more optimistic updates
  });

  it('should clear all optimistic updates', () => {
    const initialData = { id: 1, name: 'initial' };
    const { result } = renderHook(() => 
      useOptimisticUpdate({ initialData })
    );
    
    const optimisticData = { id: 1, name: 'optimistic' };
    
    act(() => {
      result.current.startOptimisticUpdate(optimisticData);
    });
    
    expect(result.current.data).toEqual(optimisticData);
    expect(result.current.isOptimistic).toBe(true);
    
    act(() => {
      result.current.clearAllOptimisticUpdates();
    });
    
    expect(result.current.data).toEqual(initialData);
    expect(result.current.isOptimistic).toBe(false);
  });

  it('should call success callback on confirmation', () => {
    const onSuccess = jest.fn();
    const { result } = renderHook(() => 
      useOptimisticUpdate({ onSuccess })
    );
    
    const optimisticData = { id: 1, name: 'optimistic' };
    const finalData = { id: 1, name: 'final' };
    
    let operationId: string;
    
    act(() => {
      operationId = result.current.startOptimisticUpdate(optimisticData);
    });
    
    act(() => {
      result.current.confirmOptimisticUpdate(operationId, finalData);
    });
    
    expect(onSuccess).toHaveBeenCalledWith(finalData);
  });

  it('should call error callback on rollback', () => {
    const onError = jest.fn();
    const initialData = { id: 1, name: 'initial' };
    const { result } = renderHook(() => 
      useOptimisticUpdate({ initialData, onError })
    );
    
    const optimisticData = { id: 1, name: 'optimistic' };
    const error = new Error('Update failed');
    
    let operationId: string;
    
    act(() => {
      operationId = result.current.startOptimisticUpdate(optimisticData);
    });
    
    act(() => {
      result.current.rollbackOptimisticUpdate(operationId, error);
    });
    
    expect(onError).toHaveBeenCalledWith(error, initialData);
  });

  it('should update data directly', () => {
    const { result } = renderHook(() => useOptimisticUpdate());
    
    const newData = { id: 1, name: 'new' };
    
    act(() => {
      result.current.updateData(newData);
    });
    
    expect(result.current.data).toEqual(newData);
    expect(result.current.isOptimistic).toBe(false);
  });

  it('should set error directly', () => {
    const { result } = renderHook(() => useOptimisticUpdate());
    
    const error = new Error('Direct error');
    
    act(() => {
      result.current.setError(error);
    });
    
    expect(result.current.error).toEqual(error);
  });

  it('should set loading state directly', () => {
    const { result } = renderHook(() => useOptimisticUpdate());
    
    act(() => {
      result.current.setLoading(true);
    });
    
    expect(result.current.isLoading).toBe(true);
    
    act(() => {
      result.current.setLoading(false);
    });
    
    expect(result.current.isLoading).toBe(false);
  });
});

describe('useSubscriptionOptimisticUpdate', () => {
  it('should have subscription-specific configuration', () => {
    const { result } = renderHook(() => useSubscriptionOptimisticUpdate());
    
    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isOptimistic).toBe(false);
    // This hook should have 10 second rollback delay
  });

  it('should handle subscription update optimistically', async () => {
    const { result } = renderHook(() => useSubscriptionOptimisticUpdate());
    
    const optimisticSubscription = { 
      id: 'sub-1', 
      status: 'active', 
      type: 'PREMIUM' 
    };
    
    const mockSubscriptionUpdate = jest.fn().mockResolvedValue({
      id: 'sub-1',
      status: 'active',
      type: 'PREMIUM',
      expires_at: '2024-12-31'
    });
    
    await act(async () => {
      await result.current.executeOptimisticUpdate(
        optimisticSubscription,
        mockSubscriptionUpdate
      );
    });
    
    expect(result.current.data).toEqual(optimisticSubscription);
    expect(result.current.isOptimistic).toBe(false);
    expect(mockSubscriptionUpdate).toHaveBeenCalledTimes(1);
  });
});