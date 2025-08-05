from typing import List, Optional
from pydantic import BaseModel, constr, validator

# -----------------
# Cultura Plantada
# -----------------
class CulturaPlantadaBase(BaseModel):
    nome_cultura: str
    safra: str

class CulturaPlantada(CulturaPlantadaBase):
    id: int
    propriedade_id: int

    class Config:
        from_attributes = True

# -----------------
# Propriedade Rural
# -----------------
class PropriedadeRuralBase(BaseModel):
    nome_fazenda: str
    cidade: str
    estado: str
    area_total_ha: float
    area_agricultavel_ha: float
    area_vegetacao_ha: float

    @validator("area_agricultavel_ha", "area_vegetacao_ha")
    def validate_areas_positive(cls, v):
        if v < 0:
            raise ValueError("As áreas não podem ser negativas")
        return v

class PropriedadeRuralCreate(PropriedadeRuralBase):
    culturas: Optional[List[CulturaPlantadaBase]] = []

class PropriedadeRural(PropriedadeRuralBase):
    id: int
    produtor_id: int
    culturas: List[CulturaPlantada] = []
    
    class Config:
        from_attributes = True

# -----------------
# Produtor Rural
# -----------------
class ProdutorBase(BaseModel):
    cpf_cnpj: constr(min_length=11, max_length=18)
    nome_produtor: str

    @validator("cpf_cnpj")
    def validate_cpf_cnpj_format(cls, v):
        # Validação básica de formato, não inclui a lógica dos dígitos
        v = v.replace(".", "").replace("/", "").replace("-", "")
        if not v.isdigit():
            raise ValueError("O CPF/CNPJ deve conter apenas dígitos.")
        if len(v) not in [11, 14]:
            raise ValueError("O CPF/CNPJ deve ter 11 (CPF) ou 14 (CNPJ) dígitos.")
        return v

class ProdutorCreate(ProdutorBase):
    propriedades: Optional[List[PropriedadeRuralCreate]] = []

class Produtor(ProdutorBase):
    id: int
    propriedades: List[PropriedadeRural] = []

    class Config:
        from_attributes = True