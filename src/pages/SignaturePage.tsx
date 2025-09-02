import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DigitalSignature } from '@/components/signature/DigitalSignature';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface Proposal {
  id: string;
  title: string;
  client_name: string;
  company_name: string;
  total: number;
  line_items: string;
  created_at: string;
}

const SignaturePage = () => {
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

      setProposal(data);
    } catch (error) {
      console.error('Erro ao buscar proposta:', error);
      setError('Erro ao carregar a proposta');
      toast.error('Erro ao carregar a proposta');
    } finally {
      setIsLoading(false);
    }
  };

  const renderProposalPreview = () => {
    if (!proposal || !proposal.line_items) return null;
    
    let lineItems = [];
    try {
      lineItems = JSON.parse(proposal.line_items);
    } catch (error) {
      console.error('Erro ao parsear line_items:', error);
      return null;
    }

    return (
      <div className="bg-white p-6 rounded-lg border">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{proposal.title}</h2>
          <div className="w-16 h-1 bg-primary mx-auto rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Dados da Empresa</h3>
            <div className="space-y-1">
              <p><span className="font-medium">Empresa:</span> {proposal.company_name || 'Não informado'}</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Dados do Cliente</h3>
            <div className="space-y-1">
              <p><span className="font-medium">Cliente:</span> {proposal.client_name}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Itens do Orçamento</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Descrição</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Qtd</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Valor Unit.</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">R$ {item.price.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      R$ {(item.quantity * item.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-right">
            <div className="text-xl font-bold text-gray-800">
              Total Geral: R$ {proposal.total ? proposal.total.toFixed(2) : '0.00'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando proposta...</p>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>Proposta não encontrada</CardTitle>
            <CardDescription>
              {error || 'A proposta que você está procurando não existe ou foi removida.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à Página Inicial
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Assinatura Digital</h1>
            <p className="text-muted-foreground">
              Revise a proposta abaixo e assine digitalmente para confirmar o acordo
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {renderProposalPreview()}
          
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

export default SignaturePage;