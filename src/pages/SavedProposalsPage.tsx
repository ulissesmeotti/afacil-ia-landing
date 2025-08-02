// src/pages/SavedProposalsPage.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Eye, FileText, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const SavedProposalsPage = () => {
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = () => {
    const savedProposals = JSON.parse(localStorage.getItem("propostas") || "[]");
    setProposals(savedProposals);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };
  
  const handleDelete = (id) => {
    const updatedProposals = proposals.filter(proposal => proposal.id !== id);
    localStorage.setItem("propostas", JSON.stringify(updatedProposals));
    setProposals(updatedProposals);
    toast.success("Orçamento excluído com sucesso!");
  };

  return (
    <div className="min-h-screen bg-background p-8 md:p-12">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Meus Orçamentos</h1>
          <Link to="/propostas/manual">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {proposals.length > 0 ? (
            proposals.map((proposal) => (
              <Card key={proposal.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{proposal.proposalTitle || "Orçamento sem Título"}</CardTitle>
                    <p className="text-sm text-muted-foreground">{formatDate(proposal.timestamp)}</p>
                  </div>
                  <CardDescription>Cliente: {proposal.clientName || "Não informado"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-primary">Total: R$ {proposal.total.toFixed(2)}</p>
                    <div className="flex gap-2">
                       <Link to={`/propostas/manual?id=${proposal.id}`}>
                        <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to={`/propostas/manual?id=${proposal.id}&edit=true`}>
                         <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                       <Button variant="ghost" size="icon" onClick={() => handleDelete(proposal.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center p-8">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Você ainda não salvou nenhum orçamento.</p>
              <Link to="/propostas/manual">
                <Button className="mt-4">Criar meu primeiro orçamento</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedProposalsPage;