from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean, Text, func
from database import Base

class OperacaoDiaria(Base):
    __tablename__ = "operacao_diaria"
    id = Column(Integer, primary_key=True, index=True)
    data_referencia = Column(Date, nullable=False, index=True) 
    grupo_nome = Column(String(255), nullable=False) 
    motorista_nome = Column(String(255), nullable=False)
    veiculo_placa = Column(String(20), nullable=False)
    status_cor = Column(String(20), default="verde")
    situacao_logistica = Column(String(50))
    info_viagem = Column(String(255), nullable=True)
    observacoes = Column(String(1024), nullable=True)    
    data_criacao = Column(DateTime, default=func.now())
    is_active = Column(Boolean, default=True)
    