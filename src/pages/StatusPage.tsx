import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/ui/header";
import { CheckCircle, AlertCircle, XCircle, Clock, Zap, Database, Shield, Mail, MessageSquare, Phone } from "lucide-react";

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "outage" | "maintenance";
  description: string;
  icon: React.ReactNode;
  lastChecked: Date;
}

const StatusPage = () => {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: "API Principal",
      status: "operational",
      description: "Sistema de geração de propostas",
      icon: <Zap className="h-5 w-5" />,
      lastChecked: new Date()
    },
    {
      name: "Banco de Dados",
      status: "operational",
      description: "Armazenamento e sincronização",
      icon: <Database className="h-5 w-5" />,
      lastChecked: new Date()
    },
    {
      name: "Autenticação",
      status: "operational",
      description: "Login e segurança",
      icon: <Shield className="h-5 w-5" />,
      lastChecked: new Date()
    },
    {
      name: "Geração com IA",
      status: "operational",
      description: "Serviços de inteligência artificial",
      icon: <CheckCircle className="h-5 w-5" />,
      lastChecked: new Date()
    }
  ]);

  const [overallStatus, setOverallStatus] = useState<"operational" | "issues" | "outage">("operational");

  useEffect(() => {
    // Simular verificação de status
    const checkServices = () => {
      const hasOutage = services.some(s => s.status === "outage");
      const hasIssues = services.some(s => s.status === "degraded" || s.status === "maintenance");
      
      if (hasOutage) {
        setOverallStatus("outage");
      } else if (hasIssues) {
        setOverallStatus("issues");
      } else {
        setOverallStatus("operational");
      }
    };

    checkServices();
  }, [services]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational": return "text-green-600 bg-green-100";
      case "degraded": return "text-yellow-600 bg-yellow-100";
      case "maintenance": return "text-blue-600 bg-blue-100";
      case "outage": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "degraded": return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "maintenance": return <Clock className="h-4 w-4 text-blue-600" />;
      case "outage": return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "operational": return "Operacional";
      case "degraded": return "Degradado";
      case "maintenance": return "Manutenção";
      case "outage": return "Indisponível";
      default: return "Verificando";
    }
  };

  const getOverallStatusText = () => {
    switch (overallStatus) {
      case "operational": return "Todos os sistemas operacionais";
      case "issues": return "Alguns sistemas com problemas";
      case "outage": return "Problemas reportados";
      default: return "Verificando status";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Status do Sistema</h1>
          <p className="text-muted-foreground">
            Acompanhe o status em tempo real dos nossos serviços
          </p>
        </div>

        {/* Status Geral */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {getStatusIcon(overallStatus === "operational" ? "operational" : "degraded")}
              <CardTitle className="text-2xl">
                {getOverallStatusText()}
              </CardTitle>
            </div>
            <CardDescription>
              Última verificação: {new Date().toLocaleString('pt-BR')}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Status dos Serviços */}
        <div className="space-y-4 mb-8">
          {services.map((service, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {service.icon}
                    <div>
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(service.status)}>
                      {getStatusIcon(service.status)}
                      <span className="ml-1">{getStatusText(service.status)}</span>
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {service.lastChecked.toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Métricas de Performance */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Uptime (30 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">99.9%</div>
              <p className="text-sm text-muted-foreground">Disponibilidade</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Tempo de Resposta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">< 200ms</div>
              <p className="text-sm text-muted-foreground">Média das APIs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Incidentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">0</div>
              <p className="text-sm text-muted-foreground">Últimos 7 dias</p>
            </CardContent>
          </Card>
        </div>

        {/* Histórico de Incidentes */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico Recente</CardTitle>
            <CardDescription>
              Incidentes e manutenções dos últimos 30 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Sistema Operacional</h4>
                  <p className="text-sm text-muted-foreground">
                    Todos os sistemas estão funcionando normalmente há 30 dias.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date().toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações de Contato */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Reportar Problemas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Está enfrentando problemas? Entre em contato conosco:
            </p>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:suporte@orcafacil.com.br" className="text-primary hover:underline">suporte@orcafacil.com.br</a>
              </p>
              <p className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat no canto inferior direito da plataforma
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                WhatsApp: (11) 9999-9999
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatusPage;