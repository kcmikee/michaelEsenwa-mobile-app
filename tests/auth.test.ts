import { authService } from "@/src/services/auth.service";
import { useAuthStore } from "@/src/store/AuthStore";
import { act, renderHook } from "@testing-library/react-native";

jest.mock("@/src/services/auth.service");

describe("Authentication Store", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  describe("login", () => {
    it("should successfully login user", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        role: "leader" as const,
        createdAt: new Date().toISOString(),
      };

      const mockToken = "mock-jwt-token";

      (authService.login as jest.Mock).mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login("test@example.com", "password123");
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(mockToken);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it("should handle login error", async () => {
      const mockError = {
        response: {
          data: {
            message: "Invalid credentials",
          },
        },
      };

      (authService.login as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuthStore());

      try {
        await act(async () => {
          await result.current.login("test@example.com", "wrongpassword");
        });
      } catch {}

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("register", () => {
    it("should successfully register user", async () => {
      const mockUser = {
        id: 1,
        email: "new@example.com",
        name: "New User",
        role: "leader" as const,
        createdAt: new Date().toISOString(),
      };

      const mockToken = "mock-jwt-token";

      (authService.register as jest.Mock).mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.register(
          "new@example.com",
          "password123",
          "New User"
        );
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(mockToken);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should handle registration with invite code", async () => {
      const mockUser = {
        id: 2,
        email: "invited@example.com",
        name: "Invited User",
        role: "member" as const,
        invitedBy: 1,
        createdAt: new Date().toISOString(),
      };

      (authService.register as jest.Mock).mockResolvedValue({
        user: mockUser,
        token: "mock-token",
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.register(
          "invited@example.com",
          "password123",
          "Invited User",
          "+1234567890",
          "invite-code-123"
        );
      });

      expect(result.current.user?.role).toBe("member");
      expect(result.current.user?.invitedBy).toBe(1);
    });
  });

  describe("logout", () => {
    it("should successfully logout user", async () => {
      (authService.logout as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuthStore());

      act(() => {
        useAuthStore.setState({
          user: {
            id: 1,
            email: "test@example.com",
            name: "Test",
            role: "leader",
            createdAt: "",
          },
          token: "token",
          isAuthenticated: true,
        });
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("loadStoredAuth", () => {
    it("should load stored authentication", async () => {
      const mockUser = {
        id: 1,
        email: "stored@example.com",
        name: "Stored User",
        role: "leader" as const,
        createdAt: new Date().toISOString(),
      };

      (authService.getStoredUser as jest.Mock).mockResolvedValue(mockUser);
      (authService.getStoredToken as jest.Mock).mockResolvedValue(
        "stored-token"
      );

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.loadStoredAuth();
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe("stored-token");
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it("should handle no stored auth", async () => {
      (authService.getStoredUser as jest.Mock).mockResolvedValue(null);
      (authService.getStoredToken as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.loadStoredAuth();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
