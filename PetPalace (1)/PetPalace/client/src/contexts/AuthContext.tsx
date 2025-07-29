import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@shared/schema";

interface AuthState {
  user: User | null;
  sessionToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, name: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    sessionToken: localStorage.getItem("sessionToken"),
    isLoading: true,
    isAuthenticated: false,
  });

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("sessionToken");
      if (!token) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: token,
          },
        });

        if (response.ok) {
          const user = await response.json();
          setAuthState({
            user,
            sessionToken: token,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          // Invalid token, remove it
          localStorage.removeItem("sessionToken");
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("sessionToken");
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const { user, sessionToken } = await response.json();
        localStorage.setItem("sessionToken", sessionToken);
        setAuthState({
          user,
          sessionToken,
          isLoading: false,
          isAuthenticated: true,
        });
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const signup = async (username: string, email: string, name: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, name, password }),
      });

      if (response.ok) {
        const { user, sessionToken } = await response.json();
        localStorage.setItem("sessionToken", sessionToken);
        setAuthState({
          user,
          sessionToken,
          isLoading: false,
          isAuthenticated: true,
        });
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Signup failed:", error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("sessionToken");
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: token,
          },
        });
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("sessionToken");
      setAuthState({
        user: null,
        sessionToken: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}