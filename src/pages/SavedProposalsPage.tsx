import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Header from "@/components/ui/header";
import { supabase } from "@/integrations/supabase/client";
import usePlanLimits from "@/hooks/usePlanLimits";
import { useAuth } from "@/providers/auth-provider";
import { DigitalSignature } from "@/components/signature/DigitalSignature";
import { FileText, Trash2, Eye, PenTool } from "lucide-react";
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

  const aiProposals = proposals.filter(proposal => proposal.creation_type === 'ai');
  const manualProposals = proposals.filter(proposal => proposal.creation_type === 'manual');

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
        <CardTitle>{proposal.title}</CardTitle>
        <CardDescription>Cliente: {proposal.client_name}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <div className="text-lg font-semibold">
          R$ {proposal.total ? proposal.total.toFixed(2) : '0.00'}
        </div>
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
            {/* Orçamentos com IA */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-semibold">Orçamentos com IA</h2>
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {aiProposals.length} orçamentos
                </div>
              </div>
              
              {aiProposals.length === 0 ? (
                <Card className="text-center p-6 border-dashed">
                  <CardContent>
                    <p className="text-muted-foreground mb-4">Nenhum orçamento criado com IA ainda.</p>
                    <Link to="/propostas/ai">
                      <Button variant="outline">Criar Orçamento com IA</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {aiProposals.map((proposal) => (
                    <ProposalCard key={proposal.id} proposal={proposal} />
                  ))}
                </div>
              )}
            </div>

            {/* Orçamentos Manuais */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-semibold">Orçamentos Manuais</h2>
                <div className="bg-secondary/10 text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {manualProposals.length} orçamentos
                </div>
              </div>
              
              {manualProposals.length === 0 ? (
                <Card className="text-center p-6 border-dashed">
                  <CardContent>
                    <p className="text-muted-foreground mb-4">Nenhum orçamento manual criado ainda.</p>
                    <Link to="/propostas/manual">
                      <Button variant="outline">Criar Orçamento Manual</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {manualProposals.map((proposal) => (
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