import demoStep1 from "@/assets/demo-step-1.jpg";
import demoStep2 from "@/assets/demo-step-2.jpg";
import demoStep3 from "@/assets/demo-step-3.jpg";
import demoResults from "@/assets/demo-results.jpg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart3, CheckCircle, Clock, TrendingUp, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const DemoPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">OrçaFacil IA</span>
          </Link>
          <Link to="/login">
            <Button variant="default">Começar Grátis</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            🎯 Demonstração Interativa
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Veja o OrçaFacil IA
            <br />em Ação
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            Descubra como transformamos ideias em orçamentos profissionais em apenas 3 passos simples
          </p>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Como Funciona o <span className="text-primary">OrçaFacil IA</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Do briefing inicial ao orçamento finalizado em minutos
            </p>
          </div>

          <div className="space-y-20">
            {/* Step 1 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <Badge className="bg-primary/10 text-primary">Etapa 1</Badge>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Informe os Dados do Cliente
                </h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  Preencha rapidamente as informações básicas do seu cliente e descreva 
                  brevemente o projeto. Nossa interface intuitiva torna esse processo 
                  rápido e eficiente.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-secondary" />
                    <span>Formulário inteligente com sugestões</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-secondary" />
                    <span>Histórico de clientes salvos automaticamente</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-secondary" />
                    <span>Interface responsiva e moderna</span>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-2xl rounded-2xl"></div>
                  <img 
                    src={demoStep1} 
                    alt="Interface de criação de orçamento" 
                    className="relative rounded-xl shadow-2xl w-full"
                  />
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-primary/20 blur-2xl rounded-2xl"></div>
                  <img 
                    src={demoStep2} 
                    alt="IA processando e sugerindo itens" 
                    className="relative rounded-xl shadow-2xl w-full"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <Badge className="bg-secondary/10 text-secondary">Etapa 2</Badge>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  IA Analisa e Sugere Itens
                </h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  Nossa Inteligência Artificial avançada analisa o briefing e sugere 
                  automaticamente itens, serviços e preços baseados no seu histórico 
                  e melhores práticas do mercado.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-primary" />
                    <span>Sugestões inteligentes em tempo real</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>Preços calculados automaticamente</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span>Margem de lucro otimizada</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <Badge className="bg-primary/10 text-primary">Etapa 3</Badge>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Orçamento Profissional Pronto
                </h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  Em segundos, seu orçamento profissional está pronto para envio. 
                  Design elegante, informações organizadas e formato PDF de alta qualidade 
                  que impressiona qualquer cliente.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-secondary" />
                    <span>Design profissional automatizado</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-secondary" />
                    <span>Exportação em PDF de alta qualidade</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-secondary" />
                    <span>Envio direto por email</span>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-2xl rounded-2xl"></div>
                  <img 
                    src={demoStep3} 
                    alt="Orçamento profissional em PDF" 
                    className="relative rounded-xl shadow-2xl w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Resultados que <span className="text-primary">Transformam</span> Negócios
            </h2>
            <p className="text-xl text-muted-foreground">
              Veja como o OrçaFacil IA impacta positivamente sua empresa
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <img 
                src={demoResults} 
                alt="Dashboard com resultados e métricas" 
                className="rounded-xl shadow-2xl w-full"
              />
            </div>
            <div>
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-3xl font-bold text-primary">90%</CardTitle>
                    <CardDescription>Menos tempo criando orçamentos</CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-3xl font-bold text-secondary">65%</CardTitle>
                    <CardDescription>Mais orçamentos aprovados</CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-3xl font-bold text-primary">3x</CardTitle>
                    <CardDescription>Aumento na produtividade</CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-3xl font-bold text-secondary">R$ 50K</CardTitle>
                    <CardDescription>Receita média adicional/mês</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Pronto para <span className="text-primary">Começar</span>?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Crie seu primeiro orçamento profissional em menos de 2 minutos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="hero" size="xl" className="group">
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="xl">
                Voltar ao Site
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DemoPage;