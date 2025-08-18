import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/ui/header";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Trash2 } from "lucide-react";
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
  created_at: string;
  total: number;
  line_items: string;
}

const SavedProposalsPage = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
              <Link to="/propostas/manual">
                <Button>Criar Orçamento Manual</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {proposals.map((proposal) => (
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
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(proposal.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Link to={`/propostas/${proposal.id}`}>
                      <Button size="sm">Ver Detalhes</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedProposalsPage;