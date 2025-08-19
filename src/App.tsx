// src/App.tsx
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/providers/auth-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AIGenerationPage from "./pages/AIGenerationPage";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import ManualProposalsPage from "./pages/ManualProposalsPage";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/ProfilePage";
import ProposalsPage from "./pages/ProposalsPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SavedProposalsPage from "./pages/SavedProposalsPage";

const queryClient = new QueryClient();

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { session, isLoading } = useAuth();
  if (isLoading) {
    return <div>Carregando...</div>;
  }
  return session ? children : <Navigate to="/login" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/perfil" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route
              path="/propostas"
              element={
                <PrivateRoute>
                  <ProposalsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/propostas/manual"
              element={
                <PrivateRoute>
                  <ManualProposalsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/propostas/ia"
              element={
                <PrivateRoute>
                  <AIGenerationPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/propostas/salvas"
              element={
                <PrivateRoute>
                  <SavedProposalsPage />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;