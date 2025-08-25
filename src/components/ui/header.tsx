import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Home, LogOut, User, HelpCircle, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";

const Header = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      // Se o erro for de sessão não encontrada, consideramos como logout bem-sucedido
      if (error && error.message !== "Session from session_id claim in JWT does not exist" && !error.message.includes("Auth session missing")) {
        toast.error("Erro ao sair.");
        console.error("Supabase logout error:", error);
      } else {
        // Limpar o localStorage como fallback
        localStorage.removeItem('supabase.auth.token');
        toast.success("Você saiu com sucesso!");
        navigate("/login");
      }
    } catch (err) {
      // Para qualquer outro erro, apenas limpar e redirecionar
      console.log("Logout error handled:", err);
      localStorage.removeItem('supabase.auth.token');
      toast.success("Você saiu com sucesso!");
      navigate("/login");
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4">
      <Card className="p-3 md:p-4 flex items-center justify-between sticky top-4 z-50">
        {/* Mobile Menu */}
        <div className="flex items-center gap-2 md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col gap-4 mt-8">
                <Link to="/propostas" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Home className="mr-2 h-4 w-4" /> Início
                  </Button>
                </Link>
                <Link to="/propostas/manual" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" /> Novo Orçamento
                  </Button>
                </Link>
                <Link to="/propostas/salvas" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" /> Meus Orçamentos
                  </Button>
                </Link>
                <Link to="/faq" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <HelpCircle className="mr-2 h-4 w-4" /> Ajuda
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-4 items-center">
          <Link to="/propostas">
            <Button variant="ghost">
              <Home className="mr-2 h-4 w-4" /> Início
            </Button>
          </Link>
          <Link to="/propostas/manual">
            <Button variant="ghost">
              <FileText className="mr-2 h-4 w-4" /> Novo Orçamento
            </Button>
          </Link>
          <Link to="/propostas/salvas">
            <Button variant="ghost">
              <FileText className="mr-2 h-4 w-4" /> Meus Orçamentos
            </Button>
          </Link>
          <Link to="/faq">
            <Button variant="ghost">
              <HelpCircle className="mr-2 h-4 w-4" /> Ajuda
            </Button>
          </Link>
        </nav>

        {/* User actions */}
        <div className="flex gap-2">
          <Link to="/perfil">
            <Button variant="ghost" size="icon">
              <User className="h-4 w-4" />
            </Button>
          </Link>
          <Button onClick={handleLogout} variant="destructive" size="icon">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Header;