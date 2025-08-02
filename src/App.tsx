// src/App.tsx
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AIGenerationPage from "./pages/AIGenerationPage";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import ManualProposalsPage from "./pages/ManualProposalsPage";
import NotFound from "./pages/NotFound";
import ProposalsPage from "./pages/ProposalsPage";
import SavedProposalsPage from "./pages/SavedProposalsPage"; // Adicione este import

const queryClient = new QueryClient();

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
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
            path="/propostas/salvas" // Adicione esta nova rota
            element={
              <PrivateRoute>
                <SavedProposalsPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;