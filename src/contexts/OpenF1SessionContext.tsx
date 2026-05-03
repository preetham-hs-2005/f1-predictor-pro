import { createContext, ReactNode, useContext, useMemo, useState } from "react";

interface OpenF1SessionState {
  sessionKey: number | null;
  setSessionKey: (sessionKey: number | null) => void;
}

const OpenF1SessionContext = createContext<OpenF1SessionState | null>(null);

export function OpenF1SessionProvider({ children }: { children: ReactNode }) {
  const [sessionKey, setSessionKey] = useState<number | null>(null);
  const value = useMemo(() => ({ sessionKey, setSessionKey }), [sessionKey]);

  return <OpenF1SessionContext.Provider value={value}>{children}</OpenF1SessionContext.Provider>;
}

export function useOpenF1Session() {
  const context = useContext(OpenF1SessionContext);
  if (!context) {
    throw new Error("useOpenF1Session must be used within OpenF1SessionProvider");
  }
  return context;
}

