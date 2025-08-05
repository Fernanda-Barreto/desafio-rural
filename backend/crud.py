from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, exc
from fastapi import HTTPException
import models, schemas
import re

# --- Funções de Validação ---
def is_valid_cpf(cpf: str) -> bool:
    cpf = re.sub(r'[^0-9]', '', cpf)
    if len(cpf) != 11 or len(set(cpf)) == 1:
        return False
    for i in range(9, 11):
        value = sum((int(cpf[num]) * ((i + 1) - num) for num in range(i)))
        digit = ((value * 10) % 11) % 10
        if digit != int(cpf[i]):
            return False
    return True

def is_valid_cnpj(cnpj: str) -> bool:
    cnpj = re.sub(r'[^0-9]', '', cnpj)
    if len(cnpj) != 14 or len(set(cnpj)) == 1:
        return False
    
    def calculate_digit(values, factors):
        sum_of_products = sum(v * f for v, f in zip(values, factors))
        rem = sum_of_products % 11
        return 0 if rem < 2 else 11 - rem

    values = [int(c) for c in cnpj]
    
    factors1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    d1 = calculate_digit(values[:12], factors1)
    if d1 != values[12]:
        return False
        
    factors2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    d2 = calculate_digit(values[:13], factors2)
    if d2 != values[13]:
        return False
        
    return True

# Validações de negócio
def _validate_propriedade_area(propriedade: schemas.PropriedadeRuralCreate):
    if (propriedade.area_agricultavel_ha + propriedade.area_vegetacao_ha) > propriedade.area_total_ha:
        raise HTTPException(
            status_code=400,
            detail="A soma da área agricultável e de vegetação não pode ultrapassar a área total da fazenda.",
        )
    
def _validate_cpf_cnpj(cpf_cnpj: str):
    cpf_cnpj_clean = re.sub(r'[^0-9]', '', cpf_cnpj)
    if len(cpf_cnpj_clean) == 11:
        if not is_valid_cpf(cpf_cnpj_clean):
            raise HTTPException(status_code=400, detail="CPF inválido.")
    elif len(cpf_cnpj_clean) == 14:
        if not is_valid_cnpj(cpf_cnpj_clean):
            raise HTTPException(status_code=400, detail="CNPJ inválido.")
    else:
        raise HTTPException(status_code=400, detail="CPF/CNPJ deve ter 11 ou 14 dígitos.")
    
# --- Funções CRUD para Produtor ---
def get_produtor(db: Session, produtor_id: int):
    return db.query(models.Produtor).filter(models.Produtor.id == produtor_id).first()

def get_produtor_by_cpf_cnpj(db: Session, cpf_cnpj: str):
    return db.query(models.Produtor).filter(models.Produtor.cpf_cnpj == cpf_cnpj).first()

# CORREÇÃO: Adicionada a instrução joinedload para carregar as propriedades e culturas
def get_produtores(db: Session, skip: int = 0, limit: int = 100, cpf_cnpj: str = None):
    query = db.query(models.Produtor).options(
        joinedload(models.Produtor.propriedades).joinedload(models.PropriedadeRural.culturas)
    )
    if cpf_cnpj:
        query = query.filter(models.Produtor.cpf_cnpj == re.sub(r'[^0-9]', '', cpf_cnpj))
    return query.offset(skip).limit(limit).all()

# CORREÇÃO: Lógica para verificar duplicatas antes de criar
def create_produtor(db: Session, produtor_schema: schemas.ProdutorCreate):
    _validate_cpf_cnpj(produtor_schema.cpf_cnpj)
    
    existing_produtor = get_produtor_by_cpf_cnpj(db, re.sub(r'[^0-9]', '', produtor_schema.cpf_cnpj))
    if existing_produtor:
        raise HTTPException(status_code=400, detail="CPF/CNPJ já cadastrado.")
    
    db_produtor = models.Produtor(
        cpf_cnpj=re.sub(r'[^0-9]', '', produtor_schema.cpf_cnpj),
        nome_produtor=produtor_schema.nome_produtor
    )
    
    db.add(db_produtor)
    db.commit()
    db.refresh(db_produtor)

    for prop in produtor_schema.propriedades:
        _validate_propriedade_area(prop)
        db_propriedade = models.PropriedadeRural(**prop.dict(exclude={'culturas'}), produtor_id=db_produtor.id)
        db.add(db_propriedade)
        db.commit()
        db.refresh(db_propriedade)
        for cultura in prop.culturas:
            db_cultura = models.CulturaPlantada(**cultura.dict(), propriedade_id=db_propriedade.id)
            db.add(db_cultura)
            db.commit()
    
    return get_produtor(db, db_produtor.id)

# CORREÇÃO: Lógica completa para atualização de propriedades e culturas
def update_produtor(db: Session, produtor_id: int, produtor_data: schemas.ProdutorCreate):
    db_produtor = get_produtor(db, produtor_id)
    if not db_produtor:
        return None

    db_produtor.nome_produtor = produtor_data.nome_produtor

    existing_propriedades_ids = {p.id for p in db_produtor.propriedades}
    updated_propriedades_ids = {p.id for p in produtor_data.propriedades if p.id is not None}
    
    for prop_id in existing_propriedades_ids - updated_propriedades_ids:
        prop_to_delete = db.query(models.PropriedadeRural).filter(models.PropriedadeRural.id == prop_id).first()
        if prop_to_delete:
            db.delete(prop_to_delete)

    for prop_data in produtor_data.propriedades:
        _validate_propriedade_area(prop_data)
        
        if prop_data.id is not None:
            db_propriedade = db.query(models.PropriedadeRural).filter(models.PropriedadeRural.id == prop_data.id).first()
            if db_propriedade:
                for key, value in prop_data.dict(exclude_unset=True).items():
                    setattr(db_propriedade, key, value)
                
                existing_culturas_ids = {c.id for c in db_propriedade.culturas}
                updated_culturas_ids = {c.id for c in prop_data.culturas if c.id is not None}
                
                for cultura_id in existing_culturas_ids - updated_culturas_ids:
                    cultura_to_delete = db.query(models.CulturaPlantada).filter(models.CulturaPlantada.id == cultura_id).first()
                    if cultura_to_delete:
                        db.delete(cultura_to_delete)
                
                for cultura_data in prop_data.culturas:
                    if cultura_data.id is not None:
                        db_cultura = db.query(models.CulturaPlantada).filter(models.CulturaPlantada.id == cultura_data.id).first()
                        if db_cultura:
                            for key, value in cultura_data.dict(exclude_unset=True).items():
                                setattr(db_cultura, key, value)
                    else:
                        db_cultura = models.CulturaPlantada(**cultura_data.dict(), propriedade_id=db_propriedade.id)
                        db.add(db_cultura)

        else:
            db_propriedade = models.PropriedadeRural(**prop_data.dict(exclude={'culturas'}), produtor_id=db_produtor.id)
            db.add(db_propriedade)
            db.flush()
            
            for cultura_data in prop_data.culturas:
                db_cultura = models.CulturaPlantada(**cultura_data.dict(), propriedade_id=db_propriedade.id)
                db.add(db_cultura)

    db.commit()
    db.refresh(db_produtor)
    return db_produtor

def delete_produtor(db: Session, produtor_id: int):
    db_produtor = db.query(models.Produtor).filter(models.Produtor.id == produtor_id).first()
    if not db_produtor:
        return None
    db.delete(db_produtor)
    db.commit()
    return db_produtor

# --- Funções para o Dashboard ---
# CORREÇÃO: As funções agora retornam dicionários para serem usados diretamente na rota da API
def get_total_fazendas(db: Session):
    result = db.query(models.PropriedadeRural).count()
    return {"total_fazendas": result}

def get_total_hectares(db: Session):
    result = db.query(func.sum(models.PropriedadeRural.area_total_ha)).scalar()
    return {"total_hectares": result if result else 0}

def get_fazendas_por_estado(db: Session):
    results = db.query(models.PropriedadeRural.estado, func.count(models.PropriedadeRural.id)).group_by(models.PropriedadeRural.estado).all()
    return [{"estado": row[0], "count": row[1]} for row in results]

def get_fazendas_por_cultura(db: Session):
    results = db.query(models.CulturaPlantada.nome_cultura, func.count(models.CulturaPlantada.id)).group_by(models.CulturaPlantada.nome_cultura).all()
    return [{"cultura": row[0], "count": row[1]} for row in results]

def get_fazendas_por_uso_solo(db: Session):
    agricultavel_sum = db.query(func.sum(models.PropriedadeRural.area_agricultavel_ha)).scalar()
    vegetacao_sum = db.query(func.sum(models.PropriedadeRural.area_vegetacao_ha)).scalar()
    
    return {
        "area_agricultavel": agricultavel_sum if agricultavel_sum else 0,
        "area_vegetacao": vegetacao_sum if vegetacao_sum else 0
    }