import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Infrastructure from "./pages/Infrastructure";

function Router() {
  return (
    <Switch>
      <Route path="" component={Home} />
      <Route path="/live-view" component={Home} />
      <Route path="/playback" component={Home} />
      <Route path="/devices" component={Home} />
      <Route path="/devices/:id" component={Home} />
      <Route path="/notifications" component={Home} />
      <Route path="/settings" component={Home} />
      <Route path="/favorites" component={Home} />
      <Route path="/favorites/:id" component={Home} />
      <Route path="/ptz" component={Home} />
      <Route path="/infrastructure" component={Infrastructure} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
