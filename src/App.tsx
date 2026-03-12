import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Index from "./pages/Index";
import WeekDetail from "./pages/WeekDetail";
import GroupMatrix from "./pages/GroupMatrix";
import Login from "./pages/Login";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { useAppStore } from "./store/useAppStore";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

const App = () => {
  const { setUser } = useAppStore();

  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            
            <Route path="/week/:weekId" element={
              <ProtectedRoute>
                <WeekDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/week/:weekId/group/:groupId" element={
              <ProtectedRoute>
                <GroupMatrix />
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;