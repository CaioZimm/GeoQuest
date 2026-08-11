<div align="center">
  <h1>🌍 GeoQuest</h1>
  <p>
    <strong>O Desafio Diário de Geografia</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </p>
</div>

<hr />

## 📖 Sobre o Projeto

O **GeoQuest** é um jogo interativo diário inspirado no Wordle e no Geoguessr. A cada dia, um novo país misterioso é sorteado, e o objetivo do jogador é descobrir qual é a nação utilizando o **menor número de pistas possível**. Com um banco de dados abragendo mais de 150 países reconhecidos pela ONU, o jogo testa os conhecimentos de geografia, história e cultura dos usuários através de 6 pistas progressivas (das mais difíceis às mais fáceis).

## ✨ Principais Funcionalidades

- 🎲 **Desafio Diário Único:** Todos os usuários do mundo jogam com o mesmo país todos os dias.
- 🔍 **Autocomplete Inteligente:** Busca rápida e filtragem inteligente dos países enquanto o jogador digita.
- 📉 **Pistas Progressivas:** 6 níveis de dicas cuidadosamente criadas para balancear o desafio.
- 📊 **Estatísticas e Resultados:** Tela final com animações detalhando o desempenho do jogador.
- 🎨 **Design Moderno e Responsivo:** UI elegante e imersiva construída com Tailwind CSS e animações fluidas no Framer Motion.

## 🚀 Tecnologias Utilizadas

O projeto adota uma arquitetura fullstack robusta e moderna, separando o cliente e o servidor:

### Frontend
- **Framework:** Next.js 15
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Animações:** Framer Motion
- **Ícones:** Lucide React

### Backend
- **Framework:** FastAPI (Python)
- **ORM:** SQLAlchemy
- **Migrações:** Alembic
- **Validação de Dados:** Pydantic
- **Banco de Dados:** PostgreSQL

---

## 🛠️ Como rodar localmente (Desenvolvimento)

Siga as instruções abaixo para executar o projeto em sua máquina local.

### 1. Preparando o Banco de Dados
Certifique-se de ter o Docker instalado e inicie o PostgreSQL:
```bash
docker compose up -d
```

### 2. Configurando o Backend (API)
```bash
cd backend

# Crie o arquivo de configuração de variáveis de ambiente
cp .env.example .env

# Crie e ative o ambiente virtual
python -m venv venv
# No Windows:
.\venv\Scripts\activate
# No Linux/Mac:
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt

# Execute as migrações e popule o banco de dados com os países
alembic upgrade head
python -m app.database.seed

# Inicie o servidor FastAPI na porta 8000
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Configurando o Frontend (Web)
Em um novo terminal, instale as dependências do client e inicie o servidor:
```bash
cd frontend

# Instale as dependências do Node
npm install

# Inicie o servidor de desenvolvimento na porta 3000
npm run dev
```

Pronto! Acesse a aplicação acessando [http://localhost:3000](http://localhost:3000) no seu navegador.