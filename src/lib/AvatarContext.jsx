import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const AvatarContext = createContext(null);

export function AvatarProvider({ children }) {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [userName, setUserName] = useState("");

  const refresh = useCallback(async () => {
    try {
      const u = await base44.auth.me();
      setAvatarUrl(u?.avatar_url || null);
      setUserName(u?.full_name || "");
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <AvatarContext.Provider value={{ avatarUrl, setAvatarUrl, userName, setUserName, refresh }}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar() {
  const ctx = useContext(AvatarContext);
  if (!ctx) throw new Error("useAvatar must be used within AvatarProvider");
  return ctx;
}