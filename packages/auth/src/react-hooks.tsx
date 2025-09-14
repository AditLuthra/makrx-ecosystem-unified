"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { MakrXKeycloak } from "./keycloak-class";
import { AuthConfig, MakrXUser } from "./types";

interface KeycloakContextType {
  keycloak: MakrXKeycloak | null;
  user: MakrXUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

const KeycloakContext = createContext<KeycloakContextType | null>(null);

interface KeycloakProviderProps {
  children: ReactNode;
  config: AuthConfig;
}

export function KeycloakProvider({ children, config }: KeycloakProviderProps) {
  const [keycloak, setKeycloak] = useState<MakrXKeycloak | null>(null);
  const [user, setUser] = useState<MakrXUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initKeycloak = async () => {
      const kc = new MakrXKeycloak(config);

      kc.onAuthSuccess(async () => {
        const userInfo = await kc.getUserInfo();
        setUser(userInfo);
        setIsAuthenticated(true);
      });

      kc.onAuthLogout(() => {
        setUser(null);
        setIsAuthenticated(false);
      });

      const authenticated = await kc.init();
      if (authenticated) {
        const userInfo = await kc.getUserInfo();
        setUser(userInfo);
        setIsAuthenticated(true);
      }

      setKeycloak(kc);
      setIsLoading(false);
    };

    initKeycloak();
  }, [config]);

  const login = async () => {
    if (keycloak) {
      await keycloak.login();
    }
  };

  const logout = async () => {
    if (keycloak) {
      await keycloak.logout();
    }
  };

  const hasRole = (role: string): boolean => {
    return keycloak?.hasRole(role) ?? false;
  };

  return (
    <KeycloakContext.Provider
      value={{
        keycloak,
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </KeycloakContext.Provider>
  );
}

export function useKeycloak() {
  const context = useContext(KeycloakContext);
  if (!context) {
    throw new Error("useKeycloak must be used within a KeycloakProvider");
  }
  return context;
}

// Convenience helper: build Authorization headers from Keycloak context
// Usage:
// const getHeaders = useAuthHeaders();
// const headers = await getHeaders({ 'Content-Type': 'application/json' });
export function useAuthHeaders() {
  const { keycloak } = useKeycloak();
  return async (base: Record<string, string> = {}) => {
    try {
      // Attempt a refresh to ensure token validity
      await keycloak?.updateToken?.(30);
    } catch {}
    const token = keycloak?.getToken?.();
    return token ? { ...base, Authorization: `Bearer ${token}` } : { ...base };
  };
}
