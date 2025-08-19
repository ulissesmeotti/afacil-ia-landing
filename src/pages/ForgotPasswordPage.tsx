import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError("Erro ao enviar email de recuperação. Verifique se o email está correto.");
    } else {
      setIsSuccess(true);
      toast({
        title: "Email enviado! 📧",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    }

    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <Card className="w-full max-w-md shadow-elegant backdrop-blur-sm bg-card/95 border-0">
          <CardHeader className="space-y-2 text-center pb-8">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">📧</span>
            </div>
            <CardTitle className="text-2xl font-bold">Email Enviado!</CardTitle>
            <p className="text-muted-foreground">
              Enviamos um link de recuperação para <strong>{email}</strong>
            </p>
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-primary font-medium">
                ✓ Verifique sua caixa de entrada
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Clique no link do email para redefinir sua senha
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <Button 
                variant="outline" 
                onClick={() => setIsSuccess(false)}
                className="w-full"
              >
                Enviar para outro email
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate("/login")}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md shadow-elegant backdrop-blur-sm bg-card/95 border-0">
        <CardHeader className="space-y-2 text-center pb-8">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Esqueceu sua senha?
          </CardTitle>
          <p className="text-muted-foreground">
            Digite seu email para receber um link de recuperação
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleForgotPassword} className="grid gap-6">
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
            
            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-primary to-primary-glow hover:shadow-elegant transition-all duration-300 font-semibold" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                  Enviando...
                </div>
              ) : (
                "Enviar link de recuperação"
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

          <div className="mt-8 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;