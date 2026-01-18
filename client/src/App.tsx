import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Clients from "./pages/Clients";
import Exercises from "./pages/Exercises";
import Profile from "./pages/Profile";
import Schedule from "./pages/Schedule";
import Login from "./pages/Login";
import ClientOnboarding from "./pages/ClientOnboarding";
import ClientDetails from "./pages/ClientDetails";
import AIAssistant from "./pages/AIAssistant";
import Statistics from "./pages/Statistics";

function Router({ isAuthenticated }: { isAuthenticated: boolean }) {
  // Check if we are in onboarding mode (e.g. ?start=new_client)
  const tg = (window as any).Telegram?.WebApp;
  const startParam = tg?.initDataUnsafe?.start_param;
  const [location] = useLocation();

  if (startParam === "new_client" || location === "/onboarding") {
    return <ClientOnboarding />;
  }

  if (!isAuthenticated) {
    // If not authenticated and not onboarding, show login (or onboarding choice)
    return <Login />;
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path={"/clients"} component={Clients} />
      <Route path={"/clients/:id"} component={ClientDetails} />
      <Route path={"/exercises"} component={Exercises} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/schedule"} component={Schedule} />
      <Route path={"/ai"} component={AIAssistant} />
      <Route path={"/statistics"} component={Statistics} />
      <Route path={"/onboarding"} component={ClientOnboarding} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("ngfit_user");
    setIsAuthenticated(!!user);

    // Initialize Telegram WebApp
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.expand();
      tg.ready();

      // Auto-login for Telegram users 
      // The backend will authenticate via initData header in main.tsx
      setIsAuthenticated(true);

      // Fix keyboard issue on mobile
      const originalHeight = window.innerHeight;
      const handleResize = () => {
        if (window.innerHeight < originalHeight) {
          document.documentElement.style.height = `${originalHeight}px`;
          window.scrollTo(0, 0);
        } else {
          document.documentElement.style.height = "100vh";
        }
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <div
            className="min-h-screen w-screen bg-cover bg-center bg-fixed"
            style={{
              backgroundImage: "url('/images/gym-bg.png')",
            }}
          >
            <Router isAuthenticated={isAuthenticated} />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
