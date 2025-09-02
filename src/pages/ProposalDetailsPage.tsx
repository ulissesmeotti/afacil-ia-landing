import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DigitalSignature } from '@/components/signature/DigitalSignature';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/ui/header';
import { ArrowLeft, FileText, Calendar, User, Building } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LineItem {
  description: string;
  quantity: number;
  price: number;
}

interface Proposal {
  id: string;
  title: string;
  client_name: string;
  company_name: string;
  client_location: string;
  client_number: number;
  company_email: string;
  company_number: number;
  company_cnpj: string;
  total: number;
  line_items: string;
  created_at: string;
  deadline: string;
  payment_terms: string;
  observations: string;
  creation_type: 'ai' | 'manual';
}

const ProposalDetailsPage = () => {
  const { proposalId } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (proposalId) {
      fetchProposal();
    }
  }, [proposalId]);

  const fetchProposal = async () => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', proposalId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        setError('Proposta não encontrada');
        return;
      }

      setProposal(data as Proposal);
    } catch (error) {
      console.error('Erro ao buscar proposta:', error);
      setError('Erro ao carregar a proposta');
      toast.error('Erro ao carregar a proposta');
    } finally {
      setIsLoading(false);
    }
  };

  const renderLineItems = () => {
    if (!proposal?.line_items) return null;
    
    let lineItems: LineItem[] = [];
    try {
      lineItems = JSON.parse(proposal.line_items);
    } catch (error) {
      console.error('Erro ao parsear line_items:', error);
      return null;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Itens do Orçamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Descrição</th>
                  <th className="text-center p-2 font-semibold">Qtd</th>
                  <th className="text-right p-2 font-semibold">Valor Unit.</th>
                  <th className="text-right p-2 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2">{item.description}</td>
                    <td className="p-2 text-center">{item.quantity}</td>
                    <td className="p-2 text-right">R$ {item.price.toFixed(2)}</td>
                    <td className="p-2 text-right font-medium">
                      R$ {(item.quantity * item.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-primary">
                  <td colSpan={3} className="p-2 font-bold text-right">Total Geral:</td>
                  <td className="p-2 text-right font-bold text-lg text-primary">
                    R$ {proposal.total ? proposal.total.toFixed(2) : '0.00'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto max-w-4xl p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto max-w-4xl p-8">
          <Card className="text-center">
            <CardContent className="p-8">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Proposta não encontrada</h2>
              <p className="text-muted-foreground mb-4">
                {error || 'A proposta que você está procurando não existe ou foi removida.'}
              </p>
              <Button onClick={() => navigate('/propostas/salvas')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos orçamentos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-4xl p-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/propostas/salvas')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">{proposal.title}</h1>
            <p className="text-muted-foreground">
              Criado em {format(new Date(proposal.created_at), 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Informações Gerais */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Dados da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Nome:</span> {proposal.company_name}
                </div>
                {proposal.company_email && (
                  <div>
                    <span className="font-medium">Email:</span> {proposal.company_email}
                  </div>
                )}
                {proposal.company_number && (
                  <div>
                    <span className="font-medium">Telefone:</span> {proposal.company_number}
                  </div>
                )}
                {proposal.company_cnpj && (
                  <div>
                    <span className="font-medium">CNPJ:</span> {proposal.company_cnpj}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dados do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Nome:</span> {proposal.client_name}
                </div>
                {proposal.client_location && (
                  <div>
                    <span className="font-medium">Localização:</span> {proposal.client_location}
                  </div>
                )}
                {proposal.client_number && (
                  <div>
                    <span className="font-medium">Telefone:</span> {proposal.client_number}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Termos e Observações */}
          {(proposal.deadline || proposal.payment_terms || proposal.observations) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Termos e Condições
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {proposal.deadline && (
                  <div>
                    <span className="font-medium">Prazo de entrega:</span> {proposal.deadline}
                  </div>
                )}
                {proposal.payment_terms && (
                  <div>
                    <span className="font-medium">Condições de pagamento:</span> {proposal.payment_terms}
                  </div>
                )}
                {proposal.observations && (
                  <div>
                    <span className="font-medium">Observações:</span>
                    <p className="mt-1 text-muted-foreground">{proposal.observations}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Itens do Orçamento */}
          {renderLineItems()}

          {/* Assinatura Digital */}
          <DigitalSignature
            proposalId={proposal.id}
            proposalTitle={proposal.title}
            clientName={proposal.client_name}
            onSignatureComplete={(signatureData) => {
              toast.success('Documento assinado com sucesso!');
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProposalDetailsPage;