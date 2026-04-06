# Backend (FastAPI)

Este é o core da plataforma de administração pública, responsável pela gestão de usuários, empresas e logística de roteiros.

## 🚀 Tecnologias Utilizadas

* **Python 3.10+**
* **FastAPI**: Framework web moderno e de alta performance.
* **SQLAlchemy**: ORM para interação com o banco de dados.
* **Pydantic v2**: Validação de dados e Schemas.
* **PostgreSQL/SQLite**: Armazenamento de dados.
* **Alembic**: Migrações de banco de dados (opcional).

---

## 🛠️ Instalação e Configuração

Siga os passos abaixo para preparar o ambiente de desenvolvimento:

### 1. Clonar o Repositório
```bash
git clone <url-do-repositorio>
cd internos/backend
```

### 2. Inicializar o Ambiente Virtual (venv)
No Windows (PowerShell):    

```bash
python -m venv venv
.\venv\Scripts\Activate.ps1
```

No Linux/Mac:   

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Instalar Dependências do Backend
```bash
pip install -r requirements.txt
```

### 3.1. Gerar Dependências no development
```bash
pip freeze > requirements.txt
```



(Caso não tenha o arquivo, instale manualmente: pip install fastapi uvicorn sqlalchemy pydantic[email] passlib[bcrypt] python-jose[cryptography] python-multipart)


### 4. Configurar Variáveis de Ambiente
Crie um arquivo .env na raiz da pasta backend:

```bash
DATABASE_URL=sqlite:///./sql_app.db
SECRET_KEY=sua_chave_secreta_aqui_32_caracteres
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
```

### 🗄️ Banco de Dados
Popular com Dados Iniciais (Seed)
Para criar os usuários (admin, gestor) e as empresas iniciais (Cortezia Agro, Rotary), execute:

```bash
python seed.py
```

### 🏃 Executando a Aplicação
Para iniciar o servidor de desenvolvimento com hot-reload:

```bash
uvicorn main:app --reload
```
ou
```bash
python main.py
```

A API estará disponível em: http://127.0.0.1:8000

### 📖 Documentação Automática
O FastAPI gera a documentação Swagger e Redoc automaticamente:

Swagger UI: http://127.0.0.1:8000/docs

ReDoc: http://127.0.0.1:8000/redoc

---

📁 Estrutura de Pastas
```
backend/
├── app/
│   ├── models/      # Modelos SQLAlchemy
│   ├── schemas/     # Schemas Pydantic
│   ├── routers/     # Rotas da API
│   ├── core/        # Segurança, JWT e Configurações
│   └── database.py  # Conexão com DB
├── main.py          # Ponto de entrada da aplicação
├── seed.py          # Script de dados iniciais
└── .env             # Variáveis sensíveis (não commitado)
```

### Dica para o seu fluxo:
Como você ainda não tem um arquivo `requirements.txt`, você pode gerá-lo automaticamente agora que seu `venv` está ativo com o comando:

```bash
pip freeze > requirements.txt
```