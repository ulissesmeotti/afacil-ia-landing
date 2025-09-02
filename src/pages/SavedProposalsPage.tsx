import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Header from "@/components/ui/header";
import { supabase } from "@/integrations/supabase/client";
import usePlanLimits from "@/hooks/usePlanLimits";
import { useAuth } from "@/providers/auth-provider";
import { DigitalSignature } from "@/components/signature/DigitalSignature";
import { ProposalStatusBadge } from "@/components/proposal-status-badge";
import { ProposalStatusSelector } from "@/components/proposal-status-selector";
import { FileText, Trash2, Eye, PenTool, CheckCircle, XCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

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
  created_at: string;
  total: number;
  line_items: string;
  creation_type: 'ai' | 'manual';
  status: 'pending' | 'accepted' | 'rejected';
}

const SavedProposalsPage = () => {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const { profile, planDetails } = usePlanLimits(userId);
  
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const fetchProposals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Erro: Usuário não autenticado.");
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Erro ao carregar orçamentos.");
      console.error("Supabase error:", error);
    } else if (data) {
      setProposals(data as Proposal[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('proposals')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Erro ao excluir o orçamento.");
      console.error("Supabase error:", error);
    } else {
      toast.success("Orçamento excluído com sucesso!");
      fetchProposals();
    }
  };

  const handleStatusChange = async (proposalId: string, newStatus: 'pending' | 'accepted' | 'rejected') => {
    const { error } = await supabase
      .from('proposals')
      .update({ status: newStatus })
      .eq('id', proposalId);

    if (error) {
      toast.error("Erro ao atualizar status da proposta.");
      console.error("Supabase error:", error);
    } else {
      toast.success("Status atualizado com sucesso!");
      fetchProposals();
    }
  };

  const acceptedProposals = proposals.filter(proposal => proposal.status === 'accepted');
  const pendingProposals = proposals.filter(proposal => proposal.status === 'pending');
  const rejectedProposals = proposals.filter(proposal => proposal.status === 'rejected');

  const handleViewProposal = (proposal: Proposal) => {
    const userPlan = profile?.plan_type || 'gratuito';
    
    if (userPlan === 'enterprise') {
      // Redireciona para edição
      window.location.href = `/propostas/manual?id=${proposal.id}`;
    } else {
      // Abre modal de visualização
      setSelectedProposal(proposal);
      setIsViewModalOpen(true);
    }
  };

  const renderProposalPreview = (proposal: Proposal) => {
    if (!proposal.line_items) return null;
    
    let lineItems: LineItem[] = [];
    try {
      lineItems = JSON.parse(proposal.line_items);
    } catch (error) {
      console.error('Erro ao parsear line_items:', error);
      return null;
    }

    return (
      <div className="max-w-4xl mx-auto bg-white text-black p-8 rounded-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{proposal.title}</h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded"></div>
        </div>
        
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Dados da Empresa</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Empresa:</span> {proposal.company_name || 'Não informado'}</p>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Dados do Cliente</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Cliente:</span> {proposal.client_name}</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Itens do Orçamento</h2>
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
              {lineItems.map((item, index) => (
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
          
          <div className="mt-4 text-right">
            <div className="text-xl font-bold text-gray-800">
              Total Geral: R$ {proposal.total ? proposal.total.toFixed(2) : '0.00'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ProposalCard = ({ proposal }: { proposal: Proposal }) => (
    <Card key={proposal.id}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{proposal.title}</CardTitle>
            <CardDescription>Cliente: {proposal.client_name}</CardDescription>
          </div>
          <ProposalStatusBadge status={proposal.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold">
            R$ {proposal.total ? proposal.total.toFixed(2) : '0.00'}
          </div>
          <div className="text-sm text-muted-foreground">
            {proposal.creation_type === 'ai' ? 'IA' : 'Manual'}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <ProposalStatusSelector
            value={proposal.status}
            onValueChange={(newStatus) => handleStatusChange(proposal.id, newStatus)}
          />
          
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleViewProposal(proposal)}
              title={profile?.plan_type === 'enterprise' ? 'Editar orçamento' : 'Visualizar orçamento'}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(proposal.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Link to={`/propostas/${proposal.id}`}>
              <Button size="sm">Ver Detalhes</Button>
            </Link>
            <Dialog>
              <Button variant="ghost" size="icon" title="Assinatura Digital">
                <PenTool className="h-4 w-4" />
              </Button>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando orçamentos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8 md:p-12">
      <Header />
      <div className="container mx-auto max-w-7xl">
        <div className="my-8">
          <h1 className="text-3xl font-bold">Meus Orçamentos</h1>
          <p className="text-muted-foreground mt-2">Visualize, gerencie e edite seus orçamentos salvos.</p>
        </div>

        {proposals.length === 0 ? (
          <Card className="text-center p-8">
            <CardContent>
              <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">Nenhum orçamento encontrado.</p>
              <p className="text-muted-foreground mb-4">Crie um novo orçamento para começar!</p>
              <div className="flex gap-4 justify-center">
                <Link to="/propostas/manual">
                  <Button>Criar Orçamento Manual</Button>
                </Link>
                <Link to="/propostas/ai">
                  <Button variant="outline">Criar com IA</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Propostas Aceitas */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-semibold">Propostas Aceitas</h2>
                <div className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                  {acceptedProposals.length} propostas
                </div>
              </div>
              
              {acceptedProposals.length === 0 ? (
                <Card className="text-center p-6 border-dashed">
                  <CardContent>
                    <p className="text-muted-foreground">Nenhuma proposta aceita ainda.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {acceptedProposals.map((proposal) => (
                    <ProposalCard key={proposal.id} proposal={proposal} />
                  ))}
                </div>
              )}
            </div>

            {/* Propostas Pendentes */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <Clock className="h-6 w-6 text-yellow-600" />
                <h2 className="text-2xl font-semibold">Propostas Aguardando</h2>
                <div className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-3 py-1 rounded-full text-sm font-medium">
                  {pendingProposals.length} propostas
                </div>
              </div>
              
              {pendingProposals.length === 0 ? (
                <Card className="text-center p-6 border-dashed">
                  <CardContent>
                    <p className="text-muted-foreground mb-4">Nenhuma proposta pendente.</p>
                    <div className="flex gap-4 justify-center">
                      <Link to="/propostas/manual">
                        <Button>Criar Orçamento Manual</Button>
                      </Link>
                      <Link to="/propostas/ia">
                        <Button variant="outline">Criar com IA</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pendingProposals.map((proposal) => (
                    <ProposalCard key={proposal.id} proposal={proposal} />
                  ))}
                </div>
              )}
            </div>

            {/* Propostas Rejeitadas */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <XCircle className="h-6 w-6 text-red-600" />
                <h2 className="text-2xl font-semibold">Propostas Rejeitadas</h2>
                <div className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-3 py-1 rounded-full text-sm font-medium">
                  {rejectedProposals.length} propostas
                </div>
              </div>
              
              {rejectedProposals.length === 0 ? (
                <Card className="text-center p-6 border-dashed">
                  <CardContent>
                    <p className="text-muted-foreground">Nenhuma proposta rejeitada.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {rejectedProposals.map((proposal) => (
                    <ProposalCard key={proposal.id} proposal={proposal} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Modal de Visualização */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Visualizar Orçamento</DialogTitle>
            </DialogHeader>
            {selectedProposal && renderProposalPreview(selectedProposal)}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SavedProposalsPage;