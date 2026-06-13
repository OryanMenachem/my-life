import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const PIN_HASH_KEY = "mylife_pin_hash";

// Simple djb2 hash — never stores the raw PIN
function hashPin(pin) {
  let h = 5381;
  for (let i = 0; i < pin.length; i++) h = ((h << 5) + h) ^ pin.charCodeAt(i);
  return (h >>> 0).toString(16);
}

const AppLockContext = createContext({
  lockEnabled: false,
  locked: false,
  setLockEnabled: () => {},
  unlock: () => false,
  lock: () => {},
});

export function AppLockProvider({ children }) {
  const [lockEnabled, setLockEnabledState] = useState(false);
  const [locked, setLocked] = useState(false);

  // Load setting from user record
  useEffect(() => {
    base44.auth.me().then((me) => {
      if (me?.app_lock_enabled) {
        setLockEnabledState(true);
        setLocked(true);
      }
    }).catch(() => {});
  }, []);

  // Lock on visibility change (app resume)
  useEffect(() => {
    if (!lockEnabled) return;
    const handler = () => {
      if (document.hidden) return;
      setLocked(true);
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [lockEnabled]);

  const setLockEnabled = useCallback(async (enabled, pin = null) => {
    setLockEnabledState(enabled);
    if (enabled && pin) {
      localStorage.setItem(PIN_HASH_KEY, hashPin(pin));
      setLocked(false);
    } else if (!enabled) {
      localStorage.removeItem(PIN_HASH_KEY);
      setLocked(false);
    }
    try { await base44.auth.updateMe({ app_lock_enabled: enabled }); } catch {}
  }, []);

  const unlock = useCallback((pin) => {
    const stored = localStorage.getItem(PIN_HASH_KEY);
    if (!stored || hashPin(pin) === stored) {
      setLocked(false);
      return true;
    }
    return false;
  }, []);

  const lock = useCallback(() => {
    if (lockEnabled) setLocked(true);
  }, [lockEnabled]);

  return (
    <AppLockContext.Provider value={{ lockEnabled, locked, setLockEnabled, unlock, lock }}>
      {children}
    </AppLockContext.Provider>
  );
}

export function useAppLock() {
  return useContext(AppLockContext);
}