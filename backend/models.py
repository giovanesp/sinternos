from sqlalchemy import ForeignKey,Column, Integer, String, Boolean, DateTime, ForeignKey, Table, Date 
from sqlalchemy.orm import relationship
from database import Base
import datetime
import enum

user_empresa_association = Table(
    "user_empresa",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("empresa_id", Integer, ForeignKey("empresas.id"), primary_key=True),
    Column("data_vinculo", DateTime, default=datetime.datetime.utcnow) 
)

class User(Base):
    __tablename__ = "users"    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    nome = Column(String)
    email = Column(String)  
    role = Column(String, default="usuario") 
    is_active = Column(Boolean, default=True)
    data_cadastro = Column(DateTime, default=datetime.datetime.utcnow)
    is_director = Column(Boolean, default=False)
    eventos_na_minha_agenda = relationship("Evento", foreign_keys="Evento.diretor_id", back_populates="diretor")

    empresas = relationship(
        "Empresa", 
        secondary=user_empresa_association, 
        back_populates="usuarios"
    )

class Empresa(Base):
    __tablename__ = "empresas"    
    id = Column(Integer, primary_key=True, index=True)
    razao_social = Column(String(200))
    fantasia = Column(String(200))
    telefone = Column(String(30))
    email = Column(String(300))
    cnpj = Column(String(14))
    insc_est = Column(String(20))
    endereco = Column(String(200))
    numero = Column(String(20))
    complemento = Column(String(200))
    bairro = Column(String(100))
    cidade = Column(String(100))
    uf = Column(String(2))
    cep = Column(String(8))
    ramo = Column(String(200))
    detalhes = Column(String(1024))
    is_active = Column(Boolean, default=True)

    usuarios = relationship(
        "User", 
        secondary=user_empresa_association, 
        back_populates="empresas"
    )

class Colaborador(Base):
    __tablename__ = "colaboradores"
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(Integer)
    empresa = Column(Integer, ForeignKey("empresas.id"))
    matricula = Column(String(20))
    nome = Column(String(150), nullable=False)
    cpf = Column(String(14))
    genero = Column(String(1))
    data_nascimento = Column(Date, nullable=True)
    estado_civil = Column(String(20))
    data_admissao = Column(Date, nullable=True)
    funcao = Column(String(100))
    vinculo = Column(String(20))
    setor = Column(String(100)) 
    unidade = Column(String(100))
    ramal = Column(String(20))
    email = Column(String(150))
    whatsapp = Column(String(20))
    foto_url = Column(String(255))
    data_desligamento = Column(Date, nullable=True)
    observacao = Column(String(1024))
    situacao = Column(String(20))
    is_active = Column(Boolean, default=True)
    data_cadastro = Column(DateTime, default=datetime.datetime.utcnow)
    data_atualizacao = Column(DateTime, default=datetime.datetime.utcnow)    

class Roteiro(Base):
    __tablename__ = "roteiros"
    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"))
    parceiro_id = Column(Integer, ForeignKey("parceiros.id"))
    motorista_id = Column(Integer, ForeignKey("colaboradores.id"))    
    veiculo_id = Column(Integer, ForeignKey("veiculos.id"))
    nome_motorista = Column(String(100))
    placa_veiculo = Column(String(20))
    status = Column(String(20))
    remessa = Column(String(255), nullable=True)
    categoria = Column(String(50))
    viagem_texto = Column(String(100))
    data_carregamento = Column(Date)
    data_entrega = Column(Date)
    observacao = Column(String(1024))
    detalhes = Column(String(1024))
    is_active = Column(Boolean, default=True)
    data_cadastro = Column(DateTime, default=datetime.datetime.utcnow)
    data_atualizacao = Column(DateTime, default=datetime.datetime.utcnow)

class Parceiro(Base):
    __tablename__ = "parceiros"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    cnpj = Column(String(14))
    telefone = Column(String(20))
    email = Column(String(150))
    observacao = Column(String(1024))
    is_active = Column(Boolean, default=True)
    data_cadastro = Column(DateTime, default=datetime.datetime.utcnow)

class Veiculo(Base):
    __tablename__ = "veiculos"
    id = Column(Integer, primary_key=True, index=True)
    placa = Column(String(20), nullable=False)
    modelo = Column(String(100))
    marca = Column(String(100))
    ano = Column(Integer)
    capacidade = Column(Integer)
    tipo = Column(String(50))
    frota = Column(String(20))
    is_active = Column(Boolean, default=True)
    data_cadastro = Column(DateTime, default=datetime.datetime.utcnow)
    tags = Column(String(100))

class Evento(Base):
    __tablename__ = "eventos"
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    descricao = Column(Text, nullable=True)
    data_inicio = Column(DateTime(timezone=True), nullable=False)
    data_fim = Column(DateTime(timezone=True), nullable=False)
    cor = Column(String, default="#3174ad")
    status = Column(String, default="confirmado")
    criador_id = Column(Integer, ForeignKey("users.id"))
    diretor_id = Column(Integer, ForeignKey("users.id"))
    criador = relationship("User", foreign_keys=[criador_id])
    diretor = relationship("User", foreign_keys=[diretor_id], back_populates="eventos_na_minha_agenda")
    uid = Column(String, unique=True, index=True, default=lambda: f"{uuid.uuid4()}@seudominio.com")
    sequence = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    google_event_id = Column(String, nullable=True) 
    outlook_event_id = Column(String, nullable=True)