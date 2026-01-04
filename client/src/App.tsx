import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Clients from "./pages/Clients";
import Exercises from "./pages/Exercises";
import Profile from "./pages/Profile";
import Schedule from "./pages/Schedule";
import Login from "./pages/Login";
function Router({ isAuthenticated }: { isAuthenticated: boolean }) {
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path={"/clients"} component={Clients} />
      <Route path={"/exercises"} component={Exercises} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/schedule"} component={Schedule} />
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

      // Auto-login for Telegram users (bypass old auth)
      setIsAuthenticated(true);
      if (!user) {
        localStorage.setItem("ngfit_user", JSON.stringify({ name: "Demo User", role: "admin" }));
      }

      // Fix keyboard issue on mobile

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
