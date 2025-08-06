Gerenciador de Produtores Rurais
📌 Descrição do Projeto
Esta é uma aplicação Fullstack para gerenciar o cadastro de produtores rurais, suas propriedades e culturas plantadas. O projeto inclui um backend robusto construído com Python (FastAPI) e um frontend dinâmico em React (TypeScript), utilizando Redux Toolkit para gerenciamento de estado e styled-components para estilização.

O sistema permite operações completas de CRUD (Criar, Ler, Atualizar, Excluir) em produtores e exibe um dashboard com dados agregados e visualizações em gráficos de pizza.

✅ Requisitos de Negócio Atendidos
 Cadastro e Gestão: Permitir o cadastro, edição e exclusão de produtores rurais.

 Validação de Dados: Validar o CPF/CNPJ e garantir que a soma das áreas da fazenda não ultrapasse a área total.

 Dashboard: Exibir um dashboard com o total de fazendas, total de hectares e gráficos de pizza por estado, por cultura e por uso do solo.

 Relacionamentos: Suportar múltiplos produtores, propriedades e culturas.

🧱 Tecnologias e Arquitetura
Backend
Framework: FastAPI (Python)

Banco de Dados: PostgreSQL

ORM: SQLAlchemy

Migrações: Alembic

Conteinerização: Docker e Docker Compose

Boas Práticas: Arquitetura em camadas, logs para observabilidade

Frontend
Framework: React.js

Tooling: Vite

Linguagem: TypeScript

Gerenciamento de Estado: Redux Toolkit

Estilização: styled-components (CSS-in-JS)

Testes: Jest e React Testing Library

Boas Práticas: Componentes reutilizáveis, Atomic Design (organização de pastas)

📂 Estrutura do Projeto
bash
Copiar
Editar
.
├── backend/
│   ├── alembic/              # Migrações do Alembic
│   ├── tests/                # Testes do backend
│   ├── crud.py               # Lógica de negócio e CRUD
│   ├── database.py           # Configuração do banco de dados
│   ├── main.py               # Endpoints da API e roteamento
│   ├── models.py             # Modelos de dados do SQLAlchemy
│   ├── schemas.py            # Schemas Pydantic (validação da API)
│   └── requirements.txt      # Dependências Python
├── frontend/
│   ├── src/
│   │   ├── api/              # Lógica de requisições à API
│   │   ├── components/
│   │   │   ├── atoms/
│   │   │   ├── molecules/
│   │   │   └── organisms/
│   │   ├── pages/            # Componentes de página
│   │   ├── redux/            # Configuração e slices do Redux
│   │   ├── styles/           # Estilos globais e tema
│   │   └── App.tsx           # Componente principal
│   └── package.json          # Dependências Node.js
├── docker-compose.yml        # Orquestração de serviços Docker
└── README.md                 # Este arquivo
🚀 Como Executar a Aplicação
Siga estas instruções em terminais separados.

✅ Pré-requisitos
Docker Desktop

Node.js & npm

Python 3.10+ & pip

⚙️ 1. Configurar e Iniciar o Backend
No terminal, vá até a pasta backend:

bash
Copiar
Editar
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1    # Para PowerShell
pip install -r requirements.txt
cd ..
Subir os contêineres e o banco de dados:

bash
Copiar
Editar
docker-compose up --build
Deixe esse terminal rodando

Em um novo terminal:

bash
Copiar
Editar
cd backend
.\venv\Scripts\Activate.ps1
alembic upgrade head
Popular o banco de dados com dados fictícios:

bash
Copiar
Editar
python seed.py
💻 2. Configurar e Iniciar o Frontend
Abra um novo terminal e vá até a pasta frontend:

bash
Copiar
Editar
cd frontend
npm install
npm run dev
🌐 3. Acessar a Aplicação
Frontend: http://localhost:5173

Backend (Docs Swagger): http://localhost:8000/docs
