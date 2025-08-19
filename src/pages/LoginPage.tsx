// src/pages/LoginPage.tsx (versão completa)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getAuthErrorMessage, getSuccessMessage } from "@/lib/auth-messages";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Limpa erro anterior

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(getAuthErrorMessage(error.message));
    } else {
      const successMsg = getSuccessMessage('login');
      toast({
        title: successMsg.title,
        description: successMsg.description,
      });
      navigate("/propostas");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md shadow-elegant backdrop-blur-sm bg-card/95 border-0">
        <CardHeader className="space-y-2 text-center pb-8">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Bem-vindo de volta
          </CardTitle>
          <p className="text-muted-foreground">Entre na sua conta para continuar</p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleLogin} className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 px-4 bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password" className="text-sm font-semibold">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 px-4 pr-12 bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-background/50 rounded-md"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-primary to-primary-glow hover:shadow-elegant transition-all duration-300 font-semibold" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                  Entrando...
                </div>
              ) : (
                "Entrar na conta"
              )}
            </Button>
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive font-medium">
                  {error}
                </p>
              </div>
            )}
          </form>
            <div className="mt-8 text-center space-y-3">
              <Link 
                to="/forgot-password" 
                className="inline-block text-sm font-medium text-primary hover:text-primary-glow transition-colors"
              >
                Esqueceu sua senha?
              </Link>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link to="/register" className="font-semibold text-primary hover:text-primary-glow transition-colors">
                  Cadastre-se aqui
                </Link>
              </p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;