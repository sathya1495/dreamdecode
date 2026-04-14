import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Dream, UserProfile, DreamStats } from "@/types";
import * as db from "@/lib/database";
import { isOnboardingComplete } from "@/lib/storage";

interface AppState {
  profile: UserProfile | null;
  dreams: Dream[];
  stats: DreamStats | null;
  isLoading: boolean;
  onboardingDone: boolean;
  setOnboardingDone: (done: boolean) => void;
  refreshDreams: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppState>({
  profile: null,
  dreams: [],
  stats: null,
  isLoading: true,
  onboardingDone: false,
  setOnboardingDone: () => {},
  refreshDreams: async () => {},
  refreshProfile: async () => {},
  refreshStats: async () => {},
  refreshAll: async () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [stats, setStats] = useState<DreamStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(false);

  const refreshProfile = useCallback(async () => {
    try {
      const p = await db.getUserProfile();
      setProfile(p);
    } catch (e) {
      console.error("Error loading profile:", e);
    }
  }, []);

  const refreshDreams = useCallback(async () => {
    try {
      const d = await db.getDreams(50, 0);
      setDreams(d);
    } catch (e) {
      console.error("Error loading dreams:", e);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const s = await db.getDreamStats();
      setStats(s);
    } catch (e) {
      console.error("Error loading stats:", e);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshProfile(), refreshDreams(), refreshStats()]);
  }, [refreshProfile, refreshDreams, refreshStats]);

  useEffect(() => {
    async function init() {
      try {
        const obDone = await isOnboardingComplete();
        setOnboardingDone(obDone);
      } catch (e) {
        console.error("Onboarding check error:", e);
        setOnboardingDone(false);
      }

      try {
        await refreshAll();
      } catch (e) {
        console.error("Initial data load error:", e);
      }

      setIsLoading(false);
    }
    init();
  }, [refreshAll]);

  return (
    <AppContext.Provider
      value={{
        profile,
        dreams,
        stats,
        isLoading,
        onboardingDone,
        setOnboardingDone,
        refreshDreams,
        refreshProfile,
        refreshStats,
        refreshAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
