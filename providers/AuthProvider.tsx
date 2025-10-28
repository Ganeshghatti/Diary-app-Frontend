import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AuthState, User } from "../types/auth";

type AuthContextType = {
  state: AuthState;
  sendOtp: (phone: string) => Promise<{ success: boolean; otp: string }>;
  verifyOtp: (phone: string, code: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// No persistence; everything is in-memory for the session only.

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    // No persistence to restore; just stop loading.
    setState((s) => ({ ...s, loading: false }));
  }, []);

  const sendOtp = async (phone: string) => {
    // Dummy implementation: generate a 6-digit OTP and pretend to send.
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // In real app, call backend or Firebase here.
    // For demo, keep OTP and phone in memory only.
    (global as any).__tmpPhone = phone;
    (global as any).__tmpOtp = otp;
    return { success: true, otp };
  };

  const verifyOtp = async (phone: string, code: string) => {
    const savedOtp = (global as any).__tmpOtp || "";
    const savedPhone = (global as any).__tmpPhone || "";
    const ok = savedOtp === code && savedPhone === phone;
    if (ok) {
      const user: User = { id: Date.now().toString(), phone };
      (global as any).__tmpOtp = undefined;
      (global as any).__tmpPhone = undefined;
      setState({ user, loading: false });
      return true;
    }
    return false;
  };

  const signOut = async () => {
    // No persistence to clear.
    setState({ user: null, loading: false });
  };

  const value = useMemo<AuthContextType>(
    () => ({ state, sendOtp, verifyOtp, signOut }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
