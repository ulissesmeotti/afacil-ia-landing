import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Erro no Cadastro",
        description: error.message,
        variant: "destructive",
      });
    } else {
      await supabase.from('profiles').insert({ id: data.user.id, email: data.user.email, plan_type: 'gratuito' });
      toast({
        title: "Cadastro bem-sucedido!",
        description: "Você será redirecionado para a página de orçamentos.",
      });
      navigate("/propostas");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/5 via-background to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-elegant backdrop-blur-sm bg-card/95 border-0">
        <CardHeader className="space-y-2 text-center pb-8">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
            Crie sua conta
          </CardTitle>
          <p className="text-muted-foreground">Junte-se a nós e comece agora mesmo</p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleRegister} className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 px-4 bg-background/50 border-border/50 focus:border-secondary/50 focus:bg-background transition-all"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password" className="text-sm font-semibold">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Crie uma senha segura"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 px-4 bg-background/50 border-border/50 focus:border-secondary/50 focus:bg-background transition-all"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-secondary to-secondary/80 hover:shadow-elegant transition-all duration-300 font-semibold text-secondary-foreground" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-secondary-foreground/20 border-t-secondary-foreground rounded-full animate-spin" />
                  Cadastrando...
                </div>
              ) : (
                "Criar conta gratuita"
              )}
            </Button>
          </form>
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link to="/login" className="font-semibold text-secondary hover:text-secondary/80 transition-colors">
                Faça login aqui
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;