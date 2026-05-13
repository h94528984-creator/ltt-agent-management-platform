import React, { createContext, useContext, ReactNode, useState } from "react";
import { useGetMe } from "@workspace/api-client-react";

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  department?: string | null;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  setToken: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, forceUpdate] = useState(0);

  const { data: user, isLoading } = useGetMe({
    query: {
      retry: false,
      refetchOnWindowFocus: false,
      enabled: !!localStorage.getItem("ltt_token"),
      queryKey: undefined as any,
    } as any,
  });

  const setToken = (token: string | null) => {
    if (token) {
      localStorage.setItem("ltt_token", token);
    } else {
      localStorage.removeItem("ltt_token");
    }
    forceUpdate(n => n + 1);
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading: !!localStorage.getItem("ltt_token") && isLoading,
        isAuthenticated: !!user,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
