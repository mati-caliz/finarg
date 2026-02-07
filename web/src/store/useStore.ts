import type { CountryCode } from "@/config/countries";
import type { User } from "@/types";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),
      logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  selectedCountry: CountryCode;
  setSelectedCountry: (country: CountryCode) => void;
  selectedPais: CountryCode;
  setSelectedPais: (pais: CountryCode) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      selectedCountry: "ar" as CountryCode,
      setSelectedCountry: (country) => set({ selectedCountry: country, selectedPais: country }),
      selectedPais: "ar" as CountryCode,
      setSelectedPais: (pais) => set({ selectedPais: pais, selectedCountry: pais }),
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        selectedCountry: state.selectedCountry,
        selectedPais: state.selectedPais,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsubFinishHydration = useAppStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    setHydrated(useAppStore.persist.hasHydrated());

    return () => {
      unsubFinishHydration();
    };
  }, []);

  return hydrated;
}
