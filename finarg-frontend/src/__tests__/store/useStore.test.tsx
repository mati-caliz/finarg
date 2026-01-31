import { act, renderHook } from '@testing-library/react';
import { useAuthStore } from '@/store/useStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.logout();
    });
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useAuthStore());
    
    expect(result.current.user).toBeNull();
    expect(result.current.accessToken).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('sets auth correctly', () => {
    const { result } = renderHook(() => useAuthStore());
    
    const testUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: true,
    };
    const testToken = 'test-token-123';

    act(() => {
      result.current.setAuth(testUser, testToken);
    });

    expect(result.current.user).toEqual(testUser);
    expect(result.current.accessToken).toBe(testToken);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('logs out correctly', () => {
    const { result } = renderHook(() => useAuthStore());
    
    const testUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: true,
    };
    const testToken = 'test-token-123';

    act(() => {
      result.current.setAuth(testUser, testToken);
    });

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.accessToken).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('persists state across multiple hook calls', () => {
    const { result: result1 } = renderHook(() => useAuthStore());
    
    const testUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: true,
    };
    const testToken = 'test-token-123';

    act(() => {
      result1.current.setAuth(testUser, testToken);
    });

    const { result: result2 } = renderHook(() => useAuthStore());
    
    expect(result2.current.user).toEqual(testUser);
    expect(result2.current.accessToken).toBe(testToken);
    expect(result2.current.isAuthenticated).toBe(true);
  });
});
