import { useAuthStore } from "@/src/store/AuthStore";
import { act, renderHook } from "@testing-library/react-native";

describe("Zustand Auth Store", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useAuthStore());

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should update user state", () => {
    const { result } = renderHook(() => useAuthStore());

    const mockUser = {
      id: 1,
      email: "test@example.com",
      name: "Test User",
      role: "leader" as const,
      createdAt: new Date().toISOString(),
    };

    act(() => {
      result.current.setUser(mockUser);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("should update token state", () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setToken("mock-token");
    });

    expect(result.current.token).toBe("mock-token");
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("should clear error", () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      useAuthStore.setState({ error: "Some error" });
    });

    expect(result.current.error).toBe("Some error");

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
