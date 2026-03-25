import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Loader2 } from "lucide-react";
import { Toaster } from "sonner";
import { RouterProvider } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useActor } from "./hooks/useActor";
import { useProfile } from "./hooks/useQueries";
import { ProfileSetupDialog } from "./components/ProfileSetupDialog";
import { LandingPage } from "./components/LandingPage";
import { router } from "./router";

function AuthenticatedApp() {
  const {
    data: profile,
    isLoading: isLoadingProfile,
    isError: isProfileError,
  } = useProfile();

  const hasProfile = profile && profile.username;

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isProfileError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive">Failed to load profile.</p>
          <Button
            variant="link"
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-muted-foreground"
          >
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <ProfileSetupDialog />
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { isFetching, actor } = useActor();

  // Caffeine adds caffeineAdminToken to the hash on clone, which the
  // router misinterprets as a route. Redirect to home if present.
  useEffect(() => {
    if (identity && window.location.hash.includes("caffeineAdminToken")) {
      window.location.hash = "#/";
    }
  }, [identity]);

  let content;

  if (isInitializing) {
    content = (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  } else if (!identity) {
    content = <LandingPage />;
  } else if (!actor || isFetching) {
    content = (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  } else {
    content = <AuthenticatedApp />;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {content}
      <Toaster position="bottom-right" />
    </ThemeProvider>
  );
}
