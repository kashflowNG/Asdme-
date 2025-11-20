import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import PublicProfile from "@/pages/public-profile";
import { useEffect } from "react";
import { useLocation } from "wouter";

function Router() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Redirect root to dashboard
    if (location === "/") {
      setLocation("/dashboard");
    }
  }, [location, setLocation]);

  return (
    <Switch>
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/:username" component={PublicProfile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;