from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Produtor(Base):
    __tablename__ = "produtores"

    id = Column(Integer, primary_key=True, index=True)
    cpf_cnpj = Column(String, unique=True, index=True, nullable=False)
    nome_produtor = Column(String, nullable=False)
    
    propriedades = relationship(
        "PropriedadeRural",
        back_populates="produtor",
        cascade="all, delete-orphan"
    )

class PropriedadeRural(Base):
    __tablename__ = "propriedades_rurais"

    id = Column(Integer, primary_key=True, index=True)
    nome_fazenda = Column(String, nullable=False)
    cidade = Column(String, nullable=False)
    estado = Column(String, nullable=False)
    area_total_ha = Column(Float, nullable=False)
    area_agricultavel_ha = Column(Float, nullable=False)
    area_vegetacao_ha = Column(Float, nullable=False)

    produtor_id = Column(Integer, ForeignKey("produtores.id"))
    produtor = relationship("Produtor", back_populates="propriedades")

    culturas = relationship(
        "CulturaPlantada",
        back_populates="propriedade",
        cascade="all, delete-orphan"
    )

class CulturaPlantada(Base):
    __tablename__ = "culturas_plantadas"

    id = Column(Integer, primary_key=True, index=True)
    nome_cultura = Column(String, nullable=False)
    safra = Column(String, nullable=False)

    propriedade_id = Column(Integer, ForeignKey("propriedades_rurais.id"))
    propriedade = relationship("PropriedadeRural", back_populates="culturas")