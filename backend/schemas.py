from pydantic import BaseModel, Field, ConfigDict, EmailStr, model_validator
from typing import Optional, Literal, List, Union
from datetime import datetime, date

# =================================================================
# 1. CLASSES "SIMPLE" (Evitam circularidade e excesso de dados)
# =================================================================

class EmpresaSimple(BaseModel):
    id: int
    razao_social: str
    cnpj: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class UserSimple(BaseModel):
    id: int
    nome: str
    username: str
    role: str
    model_config = ConfigDict(from_attributes=True)

class ParceiroSimple(BaseModel):
    id: int
    nome: str
    model_config = ConfigDict(from_attributes=True)

class ColaboradorSimple(BaseModel):
    id: int
    nome: str
    model_config = ConfigDict(from_attributes=True)

class VeiculoSimple(BaseModel):
    id: int
    placa: str
    modelo: str
    model_config = ConfigDict(from_attributes=True)

# =================================================================
# 2. SCHEMAS DE USUÁRIO
# =================================================================

class UserBase(BaseModel):
    username: str 
    nome: str
    email: str
    role: Literal['admin', 'gestor', 'usuario']
    is_active: bool = True

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = Field(default=None, min_length=6)
    role: Optional[Literal['admin', 'gestor', 'usuario']] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    data_cadastro: datetime
    empresas: List[EmpresaSimple] = []
    is_director: bool
    integration_token: Optional[str] = None 

    class Config:
        model_config = ConfigDict(from_attributes=True)

class TokenIntegrationResponse(BaseModel):
    token: str
    feed_url: str

# =================================================================
# 3. SCHEMAS DE ROTEIRO
# =================================================================

class RoteiroBase(BaseModel):
    empresa_id: Optional[int] = None
    parceiro_id: Optional[int] = None
    motorista_id: Optional[int] = None    
    veiculo_id: Optional[int] = None
    nome_motorista: str  
    placa_veiculo: str  
    status: str = "Pendente"      
    remessa: Optional[str] = None 
    categoria: Optional[str] = "VIAGEM" 
    viagem_texto: Optional[str] = None
    data_carregamento: Optional[date] = None
    data_entrega: Optional[date] = None
    observacao: Optional[str] = None
    detalhes: Optional[str] = None
    is_active: bool = True

class RoteiroResponse(RoteiroBase):
    id: int
    data_cadastro: datetime
    data_atualizacao: Optional[datetime] = None
    parceiro: Optional[ParceiroSimple] = None
    motorista: Optional[ColaboradorSimple] = None
    veiculo: Optional[VeiculoSimple] = None
    empresa: Optional[EmpresaSimple] = None
    
    model_config = ConfigDict(from_attributes=True)

# =================================================================
# 4. SCHEMAS DE EMPRESA
# =================================================================

class EmpresaBase(BaseModel):
    razao_social: str
    fantasia: Optional[str] = None
    cnpj: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None
    insc_est: Optional[str] = None
    cidade: Optional[str] = None
    uf: Optional[str] = None
    ramo: Optional[str] = None
    detalhes: Optional[str] = None
    is_active: bool = True

class EmpresaCreate(EmpresaBase):
    pass

class EmpresaUpdate(EmpresaBase):
    razao_social: Optional[str] = None

class EmpresaResponse(EmpresaBase):
    id: int
    usuarios: List[UserSimple] = []
    roteiros: List[RoteiroResponse] = []
    model_config = ConfigDict(from_attributes=True)

# =================================================================
# 5. OUTROS (Colaborador, Veículo, Parceiro)
# =================================================================

class ColaboradorBase(BaseModel):
    nome: str
    empresa: str
    vinculo: Literal['efetivo', 'terceiro', 'aprendiz','estagiario','prestador','temporario']
    is_active: bool = True
    codigo: Optional[int] = None
    matricula: Optional[str] = None
    cpf: Optional[str] = None
    genero: Optional[str] = None
    data_nascimento: Optional[date] = None
    data_admissao: Optional[date] = None
    funcao: Optional[str] = None
    setor: Optional[str] = None
    unidade: Optional[str] = None
    ramal: Optional[str] = None
    email: Optional[str] = None
    whatsapp: Optional[str] = None
    foto_url: Optional[str] = None
    data_desligamento: Optional[date] = None
    observacao: Optional[str] = None
    situacao: Optional[str] = None

class ColaboradorResponse(ColaboradorBase):
    id: int
    data_cadastro: datetime
    model_config = ConfigDict(from_attributes=True)

class VeiculoBase(BaseModel):
    placa: str
    modelo: str
    is_active: bool = True

class VeiculoResponse(VeiculoBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ParceiroBase(BaseModel):
    nome: str
    cnpj: Optional[str] = None
    is_active: bool = True

class ParceiroResponse(ParceiroBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# =================================================================
# 6. REBUILD (Resolve referências de strings e circularidade)
# =================================================================
RoteiroResponse.model_rebuild()
EmpresaResponse.model_rebuild()


class EventoBase(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    data_inicio: datetime
    data_fim: datetime
    cor: Optional[str] = "#3174ad"
    diretor_id: int

    @model_validator(mode='after')
    def verificar_datas(self) -> Self:
        inicio = self.data_inicio
        fim = self.data_fim
        if inicio and fim and fim <= inicio:
            raise ValueError("A data de término deve ser posterior ao início.")
        return self

class EventoCreate(EventoBase):
    pass 

class EventoUpdate(BaseModel):
    titulo: Optional[str] = None
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    status: Optional[str] = None

class EventoOut(EventoBase):
    id: int
    criador_id: int
    uid: str
    sequence: int
    google_event_id: Optional[str] = None
    outlook_event_id: Optional[str] = None
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)