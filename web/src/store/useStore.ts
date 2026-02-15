import type { CountryCode } from "@/config/countries";
import type { SubscriptionResponse, User } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  subscription: SubscriptionResponse | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, subscription?: SubscriptionResponse) => void;
  setSubscription: (subscription: SubscriptionResponse) => void;
  logout: () => void;
  isPremium: () => boolean;
  canUseFeature: (feature: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      subscription: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, subscription) =>
        set({ user, accessToken, subscription: subscription || null, isAuthenticated: true }),
      setSubscription: (subscription) => set({ subscription }),
      logout: () =>
        set({ user: null, accessToken: null, subscription: null, isAuthenticated: false }),
      isPremium: () => {
        const subscription = get().subscription;
        return subscription?.plan === "PREMIUM" || subscription?.plan === "PROFESSIONAL";
      },
      canUseFeature: (feature: string) => {
        const subscription = get().subscription;
        if (!subscription) return false;

        switch (feature) {
          case "advanced_analytics":
            return subscription.features.hasAdvancedFeatures;
          case "export_data":
            return subscription.features.hasExportData;
          case "api_access":
            return subscription.features.hasApiAccess;
          case "unlimited_calculations":
            return subscription.features.isUnlimitedCalculations;
          default:
            return false;
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        subscription: state.subscription,
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
      setSelectedCountry: (country) => set({ selectedCountry: country }),
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        selectedCountry: state.selectedCountry,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
