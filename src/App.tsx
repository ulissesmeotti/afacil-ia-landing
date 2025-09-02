import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/providers/auth-provider";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { useOnboarding } from "@/hooks/useOnboarding";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AIGenerationPage from "./pages/AIGenerationPage";
import DemoPage from "./pages/DemoPage";
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
import SignaturePage from "./pages/SignaturePage";
import ProposalDetailsPage from "./pages/ProposalDetailsPage";
import FAQPage from "./pages/FAQPage";

const queryClient = new QueryClient();

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { session, isLoading } = useAuth();
  const { showOnboarding, isLoading: onboardingLoading, completeOnboarding } = useOnboarding();
  
  if (isLoading || onboardingLoading) {
    return <div>Carregando...</div>;
  }
  
  if (!session) {
    return <Navigate to="/login" />;
  }
  
  return (
    <>
      {children}
      {showOnboarding && (
        <OnboardingTour onComplete={completeOnboarding} />
      )}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/signature/:proposalId" element={<SignaturePage />} />
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
            <Route path="/propostas/:proposalId" element={<PrivateRoute><ProposalDetailsPage /></PrivateRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;