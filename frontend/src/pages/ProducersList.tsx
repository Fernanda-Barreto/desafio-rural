"use client"

import type React from "react"
import { useEffect, useState } from "react"
import styled from "styled-components"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "../redux/store"
import { fetchProducers, deleteProducer, type Producer } from "../redux/producersSlice"
import ProducerForm from "../components/organisms/ProducerForm"
import { PencilIcon, Trash2Icon } from "lucide-react"

// --- Estilos para replicar o visual do Tailwind e shadcn/ui ---

const PageWrapper = styled.div`
  /* container mx-auto py-8 */
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  box-sizing: border-box;
`;

const PageTitle = styled.h1`
  /* text-3xl font-bold text-center mb-8 */
  font-size: 1.875rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 2rem;
  color: #1a202c;
`;

const AddButtonWrapper = styled.div`
  /* flex justify-center mb-6 */
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const Button = styled.button`
  /* Base button styles from shadcn/ui */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  border-radius: 0.375rem; /* rounded-md */
  font-size: 0.875rem;
  font-weight: 500;
  height: 2.5rem; /* h-10 */
  padding: 0.5rem 1rem; /* px-4 py-2 */
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid transparent;

  /* Estilo do botão "Adicionar Novo Produtor" */
  &.add-producer {
    background-color: #d1d5db; /* bg-gray-300 */
    color: #1f2937; /* text-gray-800 */
    &:hover {
      background-color: #9ca3af; /* hover:bg-gray-400 */
    }
  }

  /* Estilo do botão "Editar" */
  &.edit {
    background-color: transparent;
    color: #4b5563; /* text-gray-600 */
    border: 1px solid #e5e7eb; /* border */
    &:hover {
      background-color: #f3f4f6; /* hover:bg-gray-100 */
    }
    width: 2.5rem; /* w-10 */
    padding: 0.5rem;
  }
  
  /* Estilo do botão "Excluir" */
  &.delete {
    background-color: #ef4444; /* bg-red-500 */
    color: white;
    &:hover {
      background-color: #dc2626; /* hover:bg-red-600 */
    }
    width: 2.5rem; /* w-10 */
    padding: 0.5rem;
  }
`;

const ProducersListContainer = styled.div`
  /* grid grid-cols-1 gap-4 max-w-2xl mx-auto */
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem; /* gap-4 */
  max-width: 42rem; /* max-w-2xl */
  margin: 0 auto;
`;

const ProducerCard = styled.div`
  /* Card */
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); /* shadow-sm */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
`;

const ProducerInfo = styled.div`
  /* flex-1 */
  flex: 1;
  p {
    margin: 0;
    font-weight: 500;
    color: #1f2937;
  }
  p:last-child {
    font-size: 0.875rem;
    color: #6b7280;
  }
`;

const Actions = styled.div`
  /* flex space-x-2 */
  display: flex;
  gap: 0.5rem;
`;

const ScreenReaderOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`;

// A interface ProducersListProps que estava faltando
interface ProducersListProps {
  onAddClick: () => void;
}

const ProducersList: React.FC<ProducersListProps> = ({ onAddClick }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { producers, loading, error } = useSelector((state: RootState) => state.producers);
  const [editingProducer, setEditingProducer] = useState<Producer | null>(null);

  useEffect(() => {
    dispatch(fetchProducers());
  }, [dispatch]);

  const handleDelete = (id: number | undefined) => {
    if (id && window.confirm("Tem certeza que deseja excluir este produtor?")) {
      dispatch(deleteProducer(id));
    }
  };

  const handleEdit = (producer: Producer) => {
    setEditingProducer(producer);
  };

  if (loading === "pending") {
    return <PageWrapper><PageTitle>Carregando produtores...</PageTitle></PageWrapper>;
  }

  if (error) {
    return <PageWrapper><PageTitle>Erro: {error}</PageTitle></PageWrapper>;
  }

  if (editingProducer) {
    return <ProducerForm initialData={editingProducer} onClose={() => setEditingProducer(null)} />;
  }

  return (
    <PageWrapper>
      <PageTitle>Lista de Produtores</PageTitle>
      <AddButtonWrapper>
        {/* Agora o onClick chama a prop onAddClick passada pelo App.tsx */}
        <Button className="add-producer" onClick={onAddClick}>
          Adicionar Novo Produtor
        </Button>
      </AddButtonWrapper>
      <ProducersListContainer>
        {producers.map((producer) => (
          <ProducerCard key={producer.id}>
            <ProducerInfo>
              <p>{producer.nome_produtor}</p>
              <p>{producer.cpf_cnpj}</p>
            </ProducerInfo>
            <Actions>
              <Button className="edit" onClick={() => handleEdit(producer)}>
                <PencilIcon size={16} />
                <ScreenReaderOnly>Editar</ScreenReaderOnly>
              </Button>
              <Button className="delete" onClick={() => handleDelete(producer.id)}>
                <Trash2Icon size={16} />
                <ScreenReaderOnly>Excluir</ScreenReaderOnly>
              </Button>
            </Actions>
          </ProducerCard>
        ))}
      </ProducersListContainer>
    </PageWrapper>
  );
};

export default ProducersList;