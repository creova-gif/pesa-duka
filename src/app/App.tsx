import { RouterProvider } from "react-router";
import { ThemeProvider } from "next-themes";
import { router } from "./routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { initializeDatabase } from "./lib/api";
import { Toaster } from "sonner";
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
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-5 shadow-lg" style={{ animation: "pulse 1.5s ease-in-out infinite" }}>
            <span className="text-white font-black text-3xl">P</span>
          </div>
          <div className="font-black text-xl tracking-tight mb-1">
            PESA <span style={{ color: "#E56B0A" }}>DUKA</span>
          </div>
          <p className="text-xs text-muted-foreground">Biashara Bora · Loading...</p>
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
