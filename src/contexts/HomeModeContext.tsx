import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { apiFetch } from "@/lib/api";

type HomeMode = "home" | "away" | "night";

interface HomeModeContextValue {
  mode: HomeMode | null;
  setMode: (m: HomeMode) => Promise<void>;
  refresh: () => Promise<void>;
  unreadCount: number;
  refreshUnread: () => Promise<void>;
}

const HomeModeContext = createContext<HomeModeContextValue | undefined>(undefined);

export function HomeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<HomeMode | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const data = await apiFetch("/home/mode");
      setModeState(data.mode);
    } catch {
      // ignore
    }
  }, []);

  const refreshUnread = useCallback(async () => {
    try {
      const data = await apiFetch("/alerts/unread");
      setUnreadCount(Array.isArray(data) ? data.length : 0);
    } catch {
      // ignore
    }
  }, []);

  const setMode = useCallback(async (m: HomeMode) => {
    const data = await apiFetch("/home/mode", {
      method: "PATCH",
      body: JSON.stringify({ mode: m }),
    });
    setModeState(data.mode ?? m);
  }, []);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      refresh();
      refreshUnread();
      const t = setInterval(refreshUnread, 20000);
      return () => clearInterval(t);
    }
  }, [refresh, refreshUnread]);

  return (
    <HomeModeContext.Provider value={{ mode, setMode, refresh, unreadCount, refreshUnread }}>
      {children}
    </HomeModeContext.Provider>
  );
}

export function useHomeMode() {
  const ctx = useContext(HomeModeContext);
  if (!ctx) throw new Error("useHomeMode must be used inside HomeModeProvider");
  return ctx;
}
