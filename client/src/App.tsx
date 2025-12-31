import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import QuestionsPage from "@/pages/questions";
import ChaptersPage from "@/pages/chapters";
import PracticePage from "@/pages/practice";
import MockPage from "@/pages/mock";
import ReportsPage from "@/pages/reports";
import AnalyticsPage from "@/pages/analytics";
import TenantsPage from "@/pages/admin/tenants";
import UsersPage from "@/pages/admin/users";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/dashboard">
        <ProtectedRoute component={DashboardPage} />
      </Route>
      <Route path="/questions">
        <ProtectedRoute component={QuestionsPage} />
      </Route>
      <Route path="/questions/upload">
        <ProtectedRoute component={QuestionsPage} />
      </Route>
      <Route path="/chapters">
        <ProtectedRoute component={ChaptersPage} />
      </Route>
      <Route path="/practice">
        <ProtectedRoute component={PracticePage} />
      </Route>
      <Route path="/mock">
        <ProtectedRoute component={MockPage} />
      </Route>
      <Route path="/reports">
        <ProtectedRoute component={ReportsPage} />
      </Route>
      <Route path="/results">
        <ProtectedRoute component={ReportsPage} />
      </Route>
      <Route path="/analytics">
        <ProtectedRoute component={AnalyticsPage} />
      </Route>
      <Route path="/admin/tenants">
        <ProtectedRoute component={TenantsPage} />
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute component={UsersPage} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
