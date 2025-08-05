from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
from database import SessionLocal, engine
import crud, models, schemas

# Configuração do logger para observabilidade
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Cria as tabelas se elas ainda não existirem.
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Dependência para obter a sessão do banco de dados
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------------------
# Endpoints de CRUD - Produtor
# ---------------------------
@app.post("/produtores/", response_model=schemas.Produtor, status_code=status.HTTP_201_CREATED)
def create_produtor_endpoint(produtor: schemas.ProdutorCreate, db: Session = Depends(get_db)):
    logger.info(f"Recebida requisição para criar produtor: {produtor.nome_produtor}")
    try:
        new_produtor = crud.create_produtor(db, produtor_schema=produtor)
        logger.info(f"Produtor criado com sucesso, ID: {new_produtor.id}")
        return new_produtor
    except HTTPException as e:
        logger.error(f"Erro ao criar produtor: {e.detail}")
        raise e

# CORREÇÃO: Adicionado o parâmetro 'cpf_cnpj' para buscar produtores específicos
@app.get("/produtores/", response_model=List[schemas.Produtor])
def read_produtores_endpoint(skip: int = 0, limit: int = 100, cpf_cnpj: Optional[str] = None, db: Session = Depends(get_db)):
    logger.info("Recebida requisição para listar produtores")
    produtores = crud.get_produtores(db, skip=skip, limit=limit, cpf_cnpj=cpf_cnpj)
    return produtores

@app.get("/produtores/{produtor_id}", response_model=schemas.Produtor)
def read_produtor_endpoint(produtor_id: int, db: Session = Depends(get_db)):
    logger.info(f"Recebida requisição para buscar produtor com ID: {produtor_id}")
    db_produtor = crud.get_produtor(db, produtor_id=produtor_id)
    if db_produtor is None:
        logger.warning(f"Produtor com ID {produtor_id} não encontrado")
        raise HTTPException(status_code=404, detail="Produtor não encontrado")
    return db_produtor

@app.put("/produtores/{produtor_id}", response_model=schemas.Produtor)
def update_produtor_endpoint(produtor_id: int, produtor_data: schemas.ProdutorCreate, db: Session = Depends(get_db)):
    logger.info(f"Recebida requisição para atualizar produtor com ID: {produtor_id}")
    updated_produtor = crud.update_produtor(db, produtor_id, produtor_data)
    if not updated_produtor:
        logger.warning(f"Produtor com ID {produtor_id} não encontrado para atualização")
        raise HTTPException(status_code=404, detail="Produtor não encontrado")
    logger.info(f"Produtor com ID {produtor_id} atualizado com sucesso")
    return updated_produtor

@app.delete("/produtores/{produtor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_produtor_endpoint(produtor_id: int, db: Session = Depends(get_db)):
    logger.info(f"Recebida requisição para deletar produtor com ID: {produtor_id}")
    if not crud.delete_produtor(db, produtor_id=produtor_id):
        logger.warning(f"Produtor com ID {produtor_id} não encontrado para deleção")
        raise HTTPException(status_code=404, detail="Produtor não encontrado")
    logger.info(f"Produtor com ID {produtor_id} deletado com sucesso")
    return {"message": "Produtor excluído com sucesso"}

# ---------------------------
# Endpoints do Dashboard
# ---------------------------
# CORREÇÃO: As rotas agora retornam o resultado direto da função de CRUD
@app.get("/dashboard/total_fazendas")
def get_total_fazendas_endpoint(db: Session = Depends(get_db)):
    logger.info("Buscando total de fazendas")
    total = crud.get_total_fazendas(db)
    return total

@app.get("/dashboard/total_hectares")
def get_total_hectares_endpoint(db: Session = Depends(get_db)):
    logger.info("Buscando total de hectares")
    total = crud.get_total_hectares(db)
    return total

@app.get("/dashboard/por_estado")
def get_fazendas_por_estado_endpoint(db: Session = Depends(get_db)):
    logger.info("Buscando dados de fazendas por estado")
    data = crud.get_fazendas_por_estado(db)
    return data

@app.get("/dashboard/por_cultura")
def get_fazendas_por_cultura_endpoint(db: Session = Depends(get_db)):
    logger.info("Buscando dados de fazendas por cultura")
    data = crud.get_fazendas_por_cultura(db)
    return data

@app.get("/dashboard/por_uso_solo")
def get_fazendas_por_uso_solo_endpoint(db: Session = Depends(get_db)):
    logger.info("Buscando dados de uso do solo")
    data = crud.get_fazendas_por_uso_solo(db)
    return data