import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { FileText, Home, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair.");
      console.error("Supabase logout error:", error);
    } else {
      toast.success("Você saiu com sucesso!");
      navigate("/login");
    }
  };

  return (
    <div className="container mx-auto max-w-7xl">
      <Card className="p-4 flex items-center justify-between sticky top-4 z-50">
        <nav className="flex gap-4 items-center">
          <Link to="/propostas">
            <Button variant="ghost" className="hidden md:flex">
              <Home className="mr-2 h-4 w-4" /> Início
            </Button>
          </Link>
          <Link to="/propostas/manual">
            <Button variant="ghost" className="hidden md:flex">
              <FileText className="mr-2 h-4 w-4" /> Novo Orçamento
            </Button>
          </Link>
          <Link to="/propostas/salvas">
            <Button variant="ghost" className="hidden md:flex">
              <FileText className="mr-2 h-4 w-4" /> Meus Orçamentos
            </Button>
          </Link>
        </nav>
        <div className="flex gap-4">
          <Link to="/perfil">
            <Button variant="ghost">
              <User className="h-4 w-4" />
            </Button>
          </Link>
          <Button onClick={handleLogout} variant="destructive">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Header;