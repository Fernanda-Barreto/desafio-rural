// src/components/ProducerForm.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../../redux/store';
import { 
  createProducer, 
  updateProducer,
  fetchProducerByCpfCnpj
} from '../../redux/producersSlice';
import type { Producer } from '../../redux/producersSlice';
import { cpf, cnpj } from 'cpf-cnpj-validator';

// Interface para propriedades rurais no formulário
interface PropriedadeRuralFormState {
  id?: number | string;
  localId: string;
  nome_fazenda: string;
  cidade: string;
  estado: string;
  area_total_ha: number | string;
  area_agricultavel_ha: number | string;
  area_vegetacao_ha: number | string;
  culturas: Array<{ nome_cultura: string; safra: string }>;
}

// Interface para estado do formulário do produtor
interface ProducerFormState {
  id?: string | number;
  nome_produtor: string;
  cpf_cnpj: string;
  propriedades: PropriedadeRuralFormState[];
}

// Styled Components
const PageWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  min-height: calc(100vh - 80px);
  padding: 1.5rem;
  box-sizing: border-box;
`;

const FormCard = styled.div`
  width: 100%;
  max-width: 40rem;
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
`;

const CardHeader = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  position: relative;
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
  color: #1a202c;
`;

const CardContent = styled.div`
  padding: 1rem 1.5rem;
`;

const FormSection = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const Label = styled.label`
  font-size: 0.8rem;
  font-weight: 500;
  line-height: 1.25rem;
  color: #1a202c;
  &.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;

const Input = styled.input`
  display: flex;
  width: 100%;
  padding: 0.4rem 0.6rem;
  font-size: 0.9rem;
  line-height: 1.5rem;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  flex: 1;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const FormTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 600;
  padding-top: 1rem;
`;

const Button = styled.button`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 0.5rem 0.8rem;
  font-weight: 600;
  color: white;
  background-color: #3b82f6;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  font-size: 0.9rem;

  &:hover {
    background-color: #2563eb;
  }

  &:disabled {
    background-color: #e5e7eb;
    cursor: not-allowed;
    color: #a1a1aa;
  }
`;

const CultureListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background-color: #f9fafb;
`;

const CultureInputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CultureFieldGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  width: 24px;
  flex-shrink: 0;

  &:hover {
    color: #dc2626;
  }
`;

const Message = styled.p`
  padding: 0.5rem;
  border-radius: 0.375rem;
  text-align: center;
  &.success {
    background-color: #dcfce7;
    color: #166534;
  }
  &.error {
    background-color: #fee2e2;
    color: #b91c1c;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #4b5563;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.8rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.5rem;
`;

interface ProducerFormProps {
  initialData?: Producer | null;
  onClose?: () => void;
}

function isError(err: any): err is Error {
  return err instanceof Error;
}

const ProducerForm: React.FC<ProducerFormProps> = ({ initialData, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.producers);

  const generateUniqueId = () => Date.now().toString();

  const [formData, setFormData] = useState<ProducerFormState>(
    initialData
      ? {
          ...initialData,
          id: initialData.id,
          propriedades: initialData.propriedades.map((prop) => ({
            ...prop,
            localId: prop.id?.toString() || generateUniqueId(),
            area_total_ha: prop.area_total_ha.toString(),
            area_agricultavel_ha: prop.area_agricultavel_ha.toString(),
            area_vegetacao_ha: prop.area_vegetacao_ha.toString(),
          })),
        }
      : {
          nome_produtor: '',
          cpf_cnpj: '',
          propriedades: [
            {
              localId: generateUniqueId(),
              nome_fazenda: '',
              cidade: '',
              estado: '',
              area_total_ha: '',
              area_agricultavel_ha: '',
              area_vegetacao_ha: '',
              culturas: [],
            },
          ],
        }
  );

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        id: initialData.id,
        propriedades: initialData.propriedades.map((prop) => ({
          ...prop,
          localId: prop.id?.toString() || generateUniqueId(),
          area_total_ha: prop.area_total_ha.toString(),
          area_agricultavel_ha: prop.area_agricultavel_ha.toString(),
          area_vegetacao_ha: prop.area_vegetacao_ha.toString(),
        })),
      });
    }
  }, [initialData]);

  const validateCpfCnpj = (value: string) => {
    const cleanedValue = value.replace(/[^0-9]/g, '');
    if (cleanedValue.length === 11) {
      if (!cpf.isValid(cleanedValue)) {
        return 'CPF inválido.';
      }
    } else if (cleanedValue.length === 14) {
      if (!cnpj.isValid(cleanedValue)) {
        return 'CNPJ inválido.';
      }
    } else {
      return 'CPF ou CNPJ deve ter 11 ou 14 dígitos.';
    }
    return null;
  };

  const validatePropriedades = (propriedades: PropriedadeRuralFormState[]) => {
    let hasError = false;
    for (const prop of propriedades) {
      const areaTotal = parseFloat(prop.area_total_ha as string);
      const areaAgricultavel = parseFloat(prop.area_agricultavel_ha as string);
      const areaVegetacao = parseFloat(prop.area_vegetacao_ha as string);

      if (areaAgricultavel + areaVegetacao > areaTotal) {
        setFormError(`A soma de Área Agricultável e Área de Vegetação (ha) na fazenda "${prop.nome_fazenda || prop.localId}" não pode ser maior que a Área Total (ha).`);
        hasError = true;
        break;
      }
    }
    return hasError;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccessMessage(null);
    setFormError(null);
  };

  const handleFarmChange = (e: React.ChangeEvent<HTMLInputElement>, localId: string) => {
    const { name, value } = e.target;
    const newFarms = formData.propriedades.map((prop) =>
      prop.localId === localId ? { ...prop, [name]: value } : prop
    );
    setFormData((prev) => ({ ...prev, propriedades: newFarms }));
    setSuccessMessage(null);
    setFormError(null);
  };

  const handleCultureChange = (e: React.ChangeEvent<HTMLInputElement>, localId: string, cultureIndex: number) => {
    const { name, value } = e.target;
    const newFarms = formData.propriedades.map((prop) => {
      if (prop.localId === localId) {
        const newCultures = [...prop.culturas];
        newCultures[cultureIndex] = { ...newCultures[cultureIndex], [name]: value };
        return { ...prop, culturas: newCultures };
      }
      return prop;
    });
    setFormData((prev) => ({ ...prev, propriedades: newFarms }));
    setSuccessMessage(null);
    setFormError(null);
  };

  const addCulture = (localId: string) => {
    const newFarms = formData.propriedades.map((prop) =>
      prop.localId === localId
        ? { ...prop, culturas: [...prop.culturas, { nome_cultura: '', safra: '' }] }
        : prop
    );
    setFormData((prev) => ({ ...prev, propriedades: newFarms }));
  };

  const removeCulture = (localId: string, cultureIndex: number) => {
    const newFarms = formData.propriedades.map((prop) => {
      if (prop.localId === localId) {
        const newCultures = prop.culturas.filter((_, index) => index !== cultureIndex);
        return { ...prop, culturas: newCultures };
      }
      return prop;
    });
    setFormData((prev) => ({ ...prev, propriedades: newFarms }));
  };

  const addPropriedade = () => {
    setFormData(prev => ({
      ...prev,
      propriedades: [...prev.propriedades, {
        localId: generateUniqueId(),
        nome_fazenda: '',
        cidade: '',
        estado: '',
        area_total_ha: '',
        area_agricultavel_ha: '',
        area_vegetacao_ha: '',
        culturas: [],
      }]
    }));
  };

  const removePropriedade = (localId: string) => {
    if (formData.propriedades.length > 1) {
      setFormData(prev => ({
        ...prev,
        propriedades: prev.propriedades.filter(prop => prop.localId !== localId)
      }));
    } else {
      setFormError('O produtor deve ter pelo menos uma propriedade.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setFormError(null);

    const cpfCnpjError = validateCpfCnpj(formData.cpf_cnpj);
    if (cpfCnpjError) {
      setFormError(cpfCnpjError);
      return;
    }

    if (validatePropriedades(formData.propriedades)) {
      return;
    }

    const dataToSubmit = {
      ...formData,
      propriedades: formData.propriedades.map((prop) => ({
        ...prop,
        area_total_ha: parseFloat(prop.area_total_ha as string),
        area_agricultavel_ha: parseFloat(prop.area_agricultavel_ha as string),
        area_vegetacao_ha: parseFloat(prop.area_vegetacao_ha as string),
      })),
    };

    try {
      if (initialData) {
        await dispatch(
          updateProducer({ id: Number(dataToSubmit.id), data: dataToSubmit as Producer }),
        ).unwrap();
        setSuccessMessage('Produtor atualizado com sucesso!');
        if (onClose) onClose();
      } else {
        const existingProducer = await dispatch(fetchProducerByCpfCnpj(dataToSubmit.cpf_cnpj)).unwrap();

        if (existingProducer) {
          const newProperties = dataToSubmit.propriedades.filter(p => !p.id);
          const producerToUpdate = {
            ...existingProducer,
            propriedades: [...existingProducer.propriedades, ...newProperties],
          };
          
          await dispatch(
            updateProducer({ id: Number(existingProducer.id), data: producerToUpdate as Producer })
          ).unwrap();
          setSuccessMessage('Novas propriedades adicionadas ao produtor existente com sucesso!');
          setFormData({
            nome_produtor: '',
            cpf_cnpj: '',
            propriedades: [{
                localId: generateUniqueId(),
                nome_fazenda: '',
                cidade: '',
                estado: '',
                area_total_ha: '',
                area_agricultavel_ha: '',
                area_vegetacao_ha: '',
                culturas: [],
            }],
          });
        } else {
          await dispatch(createProducer(dataToSubmit as Producer)).unwrap();
          setSuccessMessage('Produtor cadastrado com sucesso!');
          setFormData({
            nome_produtor: '',
            cpf_cnpj: '',
            propriedades: [
              {
                localId: generateUniqueId(),
                nome_fazenda: '',
                cidade: '',
                estado: '',
                area_total_ha: '',
                area_agricultavel_ha: '',
                area_vegetacao_ha: '',
                culturas: [],
              },
            ],
          });
        }
      }
    } catch (err) {
      if (isError(err)) {
        setFormError(err.message || 'Ocorreu um erro ao processar sua solicitação.');
      } else {
        setFormError(error || 'Ocorreu um erro desconhecido.');
      }
    }
  };

  return (
    <PageWrapper>
      <FormCard>
        <CardHeader>
          <CardTitle>{initialData ? 'Editar Produtor' : 'Cadastro de Produtor Rural'}</CardTitle>
          {initialData && onClose && <CloseButton onClick={onClose}>&times;</CloseButton>}
        </CardHeader>
        <CardContent>
          <FormSection onSubmit={handleSubmit}>
            {successMessage && <Message className="success">{successMessage}</Message>}
            {formError && <Message className="error">{formError}</Message>}

            <SectionTitle>Dados do Produtor</SectionTitle>
            <FormGroup>
              <Label htmlFor="nome_produtor">Nome do Produtor</Label>
              <Input
                id="nome_produtor"
                name="nome_produtor"
                value={formData.nome_produtor}
                onChange={handleChange}
                placeholder="Ex: João da Silva"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="cpf_cnpj">CPF ou CNPJ</Label>
              <Input
                id="cpf_cnpj"
                name="cpf_cnpj"
                value={formData.cpf_cnpj}
                onChange={handleChange}
                placeholder="Ex: 123.456.789-00 ou 00.000.000/0001-00"
                required
                disabled={!!initialData}
              />
            </FormGroup>

            {formData.propriedades.map((propriedade) => (
              <React.Fragment key={propriedade.localId}>
                <SectionTitle>Dados da Fazenda {formData.propriedades.indexOf(propriedade) + 1}</SectionTitle>
                <FormGroup>
                  <Label htmlFor={`nome_fazenda-${propriedade.localId}`}>Nome da Fazenda</Label>
                  <Input
                    id={`nome_fazenda-${propriedade.localId}`}
                    name="nome_fazenda"
                    value={propriedade.nome_fazenda}
                    onChange={(e) => handleFarmChange(e, propriedade.localId)}
                    placeholder="Ex: Fazenda Esperança"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor={`cidade-${propriedade.localId}`}>Cidade</Label>
                  <Input
                    id={`cidade-${propriedade.localId}`}
                    name="cidade"
                    value={propriedade.cidade}
                    onChange={(e) => handleFarmChange(e, propriedade.localId)}
                    placeholder="Ex: São Paulo"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor={`estado-${propriedade.localId}`}>Estado</Label>
                  <Input
                    id={`estado-${propriedade.localId}`}
                    name="estado"
                    value={propriedade.estado}
                    onChange={(e) => handleFarmChange(e, propriedade.localId)}
                    placeholder="Ex: SP"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor={`area_total_ha-${propriedade.localId}`}>Área Total (ha)</Label>
                  <Input
                    id={`area_total_ha-${propriedade.localId}`}
                    name="area_total_ha"
                    type="number"
                    min="0"
                    value={propriedade.area_total_ha === 0 ? '' : propriedade.area_total_ha}
                    onChange={(e) => handleFarmChange(e, propriedade.localId)}
                    placeholder="Ex: 1000"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor={`area_agricultavel_ha-${propriedade.localId}`}>Área Agricultável (ha)</Label>
                  <Input
                    id={`area_agricultavel_ha-${propriedade.localId}`}
                    name="area_agricultavel_ha"
                    type="number"
                    min="0"
                    value={propriedade.area_agricultavel_ha === 0 ? '' : propriedade.area_agricultavel_ha}
                    onChange={(e) => handleFarmChange(e, propriedade.localId)}
                    placeholder="Ex: 800"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor={`area_vegetacao_ha-${propriedade.localId}`}>Área de Vegetação (ha)</Label>
                  <Input
                    id={`area_vegetacao_ha-${propriedade.localId}`}
                    name="area_vegetacao_ha"
                    type="number"
                    min="0"
                    value={propriedade.area_vegetacao_ha === 0 ? '' : propriedade.area_vegetacao_ha}
                    onChange={(e) => handleFarmChange(e, propriedade.localId)}
                    placeholder="Ex: 200"
                    required
                  />
                </FormGroup>

                <FormTitle>Culturas Plantadas e Safras</FormTitle>
                <CultureListContainer>
                  {propriedade.culturas.map((cultura, cultureIndex) => (
                    <CultureInputGroup key={cultureIndex}>
                      <CultureFieldGroup>
                        <Label htmlFor={`cultura-${propriedade.localId}-${cultureIndex}-nome`} className="sr-only">
                          Nome da Cultura
                        </Label>
                        <Input
                          id={`cultura-${propriedade.localId}-${cultureIndex}-nome`}
                          name="nome_cultura"
                          placeholder="Nome da Cultura (Ex: Soja)"
                          value={cultura.nome_cultura}
                          onChange={(e) => handleCultureChange(e, propriedade.localId, cultureIndex)}
                          required
                        />
                      </CultureFieldGroup>
                      <CultureFieldGroup>
                        <Label htmlFor={`cultura-${propriedade.localId}-${cultureIndex}-safra`} className="sr-only">
                          Safra
                        </Label>
                        <Input
                          id={`cultura-${propriedade.localId}-${cultureIndex}-safra`}
                          name="safra"
                          placeholder="Safra (Ex: 2023)"
                          value={cultura.safra}
                          onChange={(e) => handleCultureChange(e, propriedade.localId, cultureIndex)}
                          required
                        />
                      </CultureFieldGroup>
                      <RemoveButton type="button" onClick={() => removeCulture(propriedade.localId, cultureIndex)}>
                        &times;
                      </RemoveButton>
                    </CultureInputGroup>
                  ))}
                  <Button type="button" onClick={() => addCulture(propriedade.localId)}>
                    Adicionar Cultura
                  </Button>
                </CultureListContainer>
                {formData.propriedades.length > 1 && (
                    <Button type="button" onClick={() => removePropriedade(propriedade.localId)}>
                        Remover esta Propriedade
                    </Button>
                )}
              </React.Fragment>
            ))}

            <Button type="button" onClick={addPropriedade}>
              Adicionar Nova Propriedade
            </Button>

            <Button type="submit" disabled={loading === 'pending'}>
              {loading === 'pending' ? 'Salvando...' : initialData ? 'Salvar Edição' : 'Cadastrar'}
            </Button>
          </FormSection>
        </CardContent>
      </FormCard>
    </PageWrapper>
  );
};

export default ProducerForm;