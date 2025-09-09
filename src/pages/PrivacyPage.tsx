import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/ui/header";
import { Link } from "react-router-dom";

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Política de Privacidade</CardTitle>
            <p className="text-muted-foreground text-center">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <h2>1. Informações Gerais</h2>
            <p>
              Esta Política de Privacidade descreve como o OrçaFacil IA coleta, usa, 
              armazena e protege suas informações pessoais em conformidade com a Lei Geral 
              de Proteção de Dados (LGPD).
            </p>

            <h2>2. Informações que Coletamos</h2>
            <h3>2.1 Informações Fornecidas por Você:</h3>
            <ul>
              <li>Nome, email e telefone durante o cadastro</li>
              <li>Informações de pagamento (processadas pelo Stripe)</li>
              <li>Conteúdo das propostas e orçamentos criados</li>
              <li>Dados da empresa (CNPJ, razão social)</li>
            </ul>

            <h3>2.2 Informações Coletadas Automaticamente:</h3>
            <ul>
              <li>Endereço IP e dados de localização</li>
              <li>Informações do navegador e dispositivo</li>
              <li>Dados de uso e navegação na plataforma</li>
              <li>Cookies e tecnologias similares</li>
            </ul>

            <h2>3. Como Usamos suas Informações</h2>
            <ul>
              <li>Fornecer e melhorar nossos serviços</li>
              <li>Processar pagamentos e gerenciar assinaturas</li>
              <li>Enviar comunicações sobre a conta e serviços</li>
              <li>Personalizar sua experiência na plataforma</li>
              <li>Detectar e prevenir fraudes</li>
              <li>Cumprir obrigações legais</li>
            </ul>

            <h2>4. Base Legal para Processamento</h2>
            <p>Processamos seus dados com base em:</p>
            <ul>
              <li><strong>Consentimento:</strong> Para comunicações de marketing</li>
              <li><strong>Execução de contrato:</strong> Para fornecer os serviços</li>
              <li><strong>Interesse legítimo:</strong> Para melhorias e segurança</li>
              <li><strong>Obrigação legal:</strong> Para cumprimento de leis</li>
            </ul>

            <h2>5. Compartilhamento de Informações</h2>
            <p>Podemos compartilhar suas informações com:</p>
            <ul>
              <li><strong>Prestadores de serviços:</strong> Stripe (pagamentos), Supabase (banco de dados)</li>
              <li><strong>Autoridades competentes:</strong> Quando exigido por lei</li>
              <li><strong>Sucessores comerciais:</strong> Em caso de fusão ou aquisição</li>
            </ul>
            <p><strong>Nunca vendemos seus dados pessoais para terceiros.</strong></p>

            <h2>6. Segurança dos Dados</h2>
            <ul>
              <li>Criptografia de dados em trânsito e em repouso</li>
              <li>Autenticação segura e controle de acesso</li>
              <li>Monitoramento contínuo de segurança</li>
              <li>Backups regulares e recuperação de dados</li>
              <li>Treinamento da equipe em proteção de dados</li>
            </ul>

            <h2>7. Retenção de Dados</h2>
            <ul>
              <li><strong>Dados da conta:</strong> Até 30 dias após cancelamento</li>
              <li><strong>Propostas e orçamentos:</strong> Conforme necessário para o serviço</li>
              <li><strong>Dados de pagamento:</strong> Conforme exigências fiscais</li>
              <li><strong>Logs de acesso:</strong> Até 12 meses</li>
            </ul>

            <h2>8. Seus Direitos (LGPD)</h2>
            <p>Você tem direito de:</p>
            <ul>
              <li><strong>Acesso:</strong> Saber quais dados temos sobre você</li>
              <li><strong>Retificação:</strong> Corrigir dados inexatos</li>
              <li><strong>Eliminação:</strong> Solicitar exclusão dos dados</li>
              <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
              <li><strong>Oposição:</strong> Se opor ao processamento</li>
              <li><strong>Revogação:</strong> Retirar consentimento a qualquer momento</li>
            </ul>

            <h2>9. Cookies</h2>
            <p>Usamos cookies para:</p>
            <ul>
              <li>Manter você logado na plataforma</li>
              <li>Lembrar suas preferências</li>
              <li>Analisar uso da plataforma</li>
              <li>Melhorar a segurança</li>
            </ul>
            <p>Você pode gerenciar cookies nas configurações do seu navegador.</p>

            <h2>10. Transferência Internacional</h2>
            <p>
              Alguns de nossos prestadores de serviços podem estar localizados fora do Brasil. 
              Garantimos que essas transferências atendam aos padrões de proteção adequados.
            </p>

            <h2>11. Menores de Idade</h2>
            <p>
              Nossos serviços são destinados a maiores de 18 anos. Não coletamos 
              intencionalmente dados de menores de idade.
            </p>

            <h2>12. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Notificaremos sobre 
              mudanças significativas por email ou na plataforma.
            </p>

            <h2>13. Contato</h2>
            <p>Para questões sobre privacidade:</p>
            <ul>
              <li><strong>Email:</strong> <a href="mailto:privacidade@orcafacil.com.br" className="text-primary hover:underline">privacidade@orcafacil.com.br</a></li>
              <li><strong>Suporte:</strong> <a href="mailto:suporte@orcafacil.com.br" className="text-primary hover:underline">suporte@orcafacil.com.br</a></li>
            </ul>

            <h2>14. Encarregado de Dados (DPO)</h2>
            <p>
              Nosso Encarregado de Proteção de Dados pode ser contatado em: 
              <a href="mailto:dpo@orcafacil.com.br" className="text-primary hover:underline ml-1">
                dpo@orcafacil.com.br
              </a>
            </p>

            <div className="mt-8 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Estamos comprometidos em proteger sua privacidade e seus dados pessoais. 
                Entre em contato conosco se tiver qualquer dúvida sobre esta política.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPage;