from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Literal
from datetime import datetime, date

class OperacaoBase(BaseModel):
    data_referencia: date
    grupo_nome: str
    motorista_nome: str
    veiculo_placa: str
    status_cor: Literal['verde', 'vermelho', 'laranja'] = 'verde'
    situacao_logistica: Optional[str] = "Em Trânsito"
    info_viagem: Optional[str] = None
    observacoes: Optional[str] = None
    is_active: bool = True

class OperacaoCreate(OperacaoBase):
    pass

class OperacaoUpdate(BaseModel):
    id: int
    grupo_nome: Optional[str] = None
    status_cor: Optional[Literal['verde', 'vermelho', 'laranja']] = None
    situacao_logistica: Optional[str] = None
    info_viagem: Optional[str] = None
    observacoes: Optional[str] = None
    is_active: Optional[bool] = None

class OperacaoResponse(OperacaoBase):
    id: int
    data_criacao: datetime
    
    model_config = ConfigDict(from_attributes=True)

class QuadroDiarioBatch(BaseModel):
    data_referencia: date
    itens: List[OperacaoCreate]

class QuadroDiarioUpdate(BaseModel):
    data_referencia: date
    itens: List[OperacaoUpdate]