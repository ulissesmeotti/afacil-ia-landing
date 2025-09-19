import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/ui/header";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Termos de Uso</CardTitle>
            <p className="text-muted-foreground text-center">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <h2>1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e usar o OrçaFacil IA, você concorda com estes Termos de Uso. 
              Se você não concordar com qualquer parte destes termos, não poderá usar nossos serviços.
            </p>

            <h2>2. Descrição do Serviço</h2>
            <p>
              O OrçaFacil IA é uma plataforma SaaS que permite aos usuários criar, gerenciar e 
              assinar propostas comerciais utilizando inteligência artificial e templates profissionais.
            </p>

            <h2>3. Registro e Conta</h2>
            <ul>
              <li>Você deve fornecer informações precisas e atualizadas durante o registro</li>
              <li>É responsável por manter a segurança de sua conta e senha</li>
              <li>Deve notificar imediatamente sobre qualquer uso não autorizado de sua conta</li>
              <li>Você é responsável por todas as atividades realizadas em sua conta</li>
            </ul>

            <h2>4. Planos e Pagamentos</h2>
            <ul>
              <li><strong>Plano Gratuito:</strong> Acesso limitado a funcionalidades básicas</li>
              <li><strong>Planos Pagos:</strong> Acesso a funcionalidades premium conforme descrição</li>
              <li>Os pagamentos são processados através do Stripe</li>
              <li>Cancelamentos podem ser feitos a qualquer momento</li>
              <li>Não há reembolsos para períodos já utilizados</li>
            </ul>

            <h2>5. Uso Aceitável</h2>
            <p>Você concorda em não usar o serviço para:</p>
            <ul>
              <li>Atividades ilegais ou fraudulentas</li>
              <li>Violar direitos de propriedade intelectual</li>
              <li>Transmitir conteúdo ofensivo, abusivo ou discriminatório</li>
              <li>Interferir no funcionamento da plataforma</li>
              <li>Tentar acessar dados de outros usuários</li>
            </ul>

            <h2>6. Propriedade Intelectual</h2>
            <p>
              Todos os direitos de propriedade intelectual da plataforma pertencem ao OrçaFacil IA. 
              Você mantém os direitos sobre o conteúdo que criar usando nossa plataforma.
            </p>

            <h2>7. Privacidade e Dados</h2>
            <p>
              O uso de seus dados pessoais é regido por nossa <Link to="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>.
            </p>

            <h2>8. Limitação de Responsabilidade</h2>
            <p>
              O OrçaFacil IA não se responsabiliza por danos indiretos, perda de dados, 
              lucros cessantes ou outros danos decorrentes do uso da plataforma.
            </p>

            <h2>9. Modificações</h2>
            <p>
              Reservamos o direito de modificar estes termos a qualquer momento. 
              Usuários serão notificados sobre mudanças significativas.
            </p>

            <h2>10. Lei Aplicável</h2>
            <p>
              Estes termos são regidos pelas leis brasileiras. Qualquer disputa será 
              resolvida no foro da comarca de São Paulo, SP.
            </p>

            <h2>11. Contato</h2>
            <p>
              Para dúvidas sobre estes termos, entre em contato: 
              <Link
                to="/contact"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4" />
                Contato
              </Link>
            </p>

            <div className="mt-8 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Ao continuar usando nossos serviços, você confirma que leu, compreendeu e 
                concorda com estes Termos de Uso.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsPage;