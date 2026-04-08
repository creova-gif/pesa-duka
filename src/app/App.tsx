import { RouterProvider } from "react-router";
import { ThemeProvider } from "next-themes";
import { router } from "./routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { initializeDatabase } from "./lib/api";
import { Toaster, toast } from "sonner";
import { getProfile, saveProfile } from "./hooks/useBusinessProfile";
import OnboardingSetup from "./components/OnboardingSetup";
import { ErrorBoundary } from "./components/ErrorBoundary";
import type { BusinessProfile } from "./hooks/useBusinessProfile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    initializeDatabase()
      .catch((err) => {
        console.warn("[PESA DUKA] DB init warning:", err);
        toast.warning("Could not reach the server. Some data may be unavailable — check your connection.", {
          duration: 8000,
          id: "db-init-warn",
        });
      })
      .finally(() => {
        setIsInitializing(false);
        const profile = getProfile();
        if (!profile.onboarded || !profile.businessName) {
          setShowOnboarding(true);
        }
      });
  }, []);

  const handleOnboardingComplete = (profile: BusinessProfile) => {
    saveProfile(profile);
    setShowOnboarding(false);
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Starting PESA DUKA...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors closeButton duration={5000} />
          {showOnboarding && (
            <OnboardingSetup onComplete={handleOnboardingComplete} />
          )}
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
