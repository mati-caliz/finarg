import { act, renderHook } from '@testing-library/react';
import { useStore } from '@/store/useStore';

describe('useStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useStore());
    act(() => {
      result.current.setUser(null);
    });
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useStore());
    
    expect(result.current.user).toBeNull();
  });

  it('sets user correctly', () => {
    const { result } = renderHook(() => useStore());
    
    const testUser = {
      id: 1,
      nombre: 'Test User',
      email: 'test@example.com',
      emailVerificado: true,
    };

    act(() => {
      result.current.setUser(testUser);
    });

    expect(result.current.user).toEqual(testUser);
  });

  it('clears user correctly', () => {
    const { result } = renderHook(() => useStore());
    
    const testUser = {
      id: 1,
      nombre: 'Test User',
      email: 'test@example.com',
      emailVerificado: true,
    };

    act(() => {
      result.current.setUser(testUser);
    });

    expect(result.current.user).toEqual(testUser);

    act(() => {
      result.current.setUser(null);
    });

    expect(result.current.user).toBeNull();
  });

  it('persists state across multiple hook calls', () => {
    const { result: result1 } = renderHook(() => useStore());
    
    const testUser = {
      id: 1,
      nombre: 'Test User',
      email: 'test@example.com',
      emailVerificado: true,
    };

    act(() => {
      result1.current.setUser(testUser);
    });

    // Create a new hook instance
    const { result: result2 } = renderHook(() => useStore());
    
    // Should have the same user
    expect(result2.current.user).toEqual(testUser);
  });
});
