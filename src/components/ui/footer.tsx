import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Home, FileText, Users, HelpCircle, Mail, Shield, BookOpen, Activity } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Navegação Principal */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Navegação</h3>
            <div className="space-y-2">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Home className="h-4 w-4" />
                Início
              </Link>
              <Link 
                to="/propostas" 
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <FileText className="h-4 w-4" />
                Minhas Propostas
              </Link>
              <Link 
                to="/propostas/ia" 
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Users className="h-4 w-4" />
                Gerar com IA
              </Link>
              <Link 
                to="/propostas/manual" 
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <FileText className="h-4 w-4" />
                Criar Manual
              </Link>
            </div>
          </div>

          {/* Suporte e Ajuda */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Suporte</h3>
            <div className="space-y-2">
              <Link 
                to="/faq" 
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <HelpCircle className="h-4 w-4" />
                FAQ
              </Link>
              <Link 
                to="/contact" 
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4" />
                Contato
              </Link>
              <Link 
                to="/demo" 
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                Como Funciona
              </Link>
              <Link 
                to="/status" 
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Activity className="h-4 w-4" />
                Status do Sistema
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <div className="space-y-2">
              <Link 
                to="/termos" 
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Shield className="h-4 w-4" />
                Termos de Uso
              </Link>
              <Link 
                to="/privacidade" 
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Shield className="h-4 w-4" />
                Política de Privacidade
              </Link>
            </div>
          </div>

          {/* Sobre */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Orça Fácil</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Crie orçamentos profissionais de forma rápida e eficiente. 
              Geração automática com IA ou criação manual, tudo em uma plataforma.
            </p>
            <p className="text-xs text-muted-foreground">
              © 2024 Orça Fácil. Todos os direitos reservados.
            </p>
          </div>
        </div>

        <Separator className="my-6" />
        
        {/* Footer Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Feito com ❤️ para facilitar sua vida profissional
          </div>
          <div className="flex gap-4">
            <Link 
              to="/perfil" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Meu Perfil
            </Link>
            <Link 
              to="/propostas/salvas" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Propostas Salvas
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;