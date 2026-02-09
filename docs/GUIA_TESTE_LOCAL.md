# 🧪 Guia de Teste Local - Plataforma de Fornecedores de Eventos

**Versão:** MVP v1.0  
**Data:** Janeiro 2025

Este guia fornece instruções passo a passo para configurar e testar o projeto localmente.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Python 3.12+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** e npm ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/downloads))

> **Nota:** Este projeto usa **SQLite** por padrão, que já vem incluído com Python. Não é necessário instalar nenhum banco de dados adicional!

---

## 🗄️ Passo 1: Configurar Banco de Dados SQLite

### 1.1 Sobre o SQLite

Este projeto usa **SQLite** por padrão, que é muito mais simples de configurar:

- ✅ **Não precisa instalar nada** - já vem com Python
- ✅ **Não precisa de servidor** - é apenas um arquivo
- ✅ **Não precisa configurar usuário/senha**
- ✅ **Funciona automaticamente** - o banco é criado na primeira execução

### 1.2 Configuração Automática

O banco de dados será criado automaticamente quando você iniciar o servidor pela primeira vez. O arquivo `database.db` será criado em `backend/database.db`.

**Não é necessário fazer nada!** Apenas continue para o próximo passo.

---

## 🔧 Passo 2: Configurar Backend

### 2.1 Navegar para o Diretório do Backend

```bash
cd backend
```

### 2.2 Criar Ambiente Virtual (Recomendado)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

> **Importante:** Após criar o ambiente virtual, você deve **ativá-lo** antes de instalar as dependências. Você saberá que está ativado quando ver `(venv)` no início da linha do terminal.

### 2.3 Instalar Dependências

**⚠️ Certifique-se de que o ambiente virtual está ativado!** Você deve ver `(venv)` no terminal.

```bash
# Com o venv ativado, instale as dependências
pip install -r requirements.txt
```

**Verificar se está funcionando:**
```bash
# Verificar se as dependências foram instaladas
pip list

# Ou verificar uma dependência específica
pip show fastapi
```

**Dependências principais:**
- FastAPI
- SQLAlchemy
- python-jose
- passlib
- pydantic
- slowapi
- alembic

> **Nota:** O projeto usa SQLite por padrão, então não é necessário instalar `psycopg2-binary` (driver do PostgreSQL).

### 2.4 Configurar Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend/`:

```env
# Database (SQLite - opcional, será usado automaticamente se não configurado)
# DATABASE_URL=sqlite:///./database.db
# Ou simplesmente deixe comentado/removido para usar SQLite automaticamente

# JWT
SECRET_KEY=sua_chave_secreta_aqui_use_openssl_rand_hex_32
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Environment
ENVIRONMENT=development
```

**Gerar SECRET_KEY:**
```bash
# Linux/Mac
openssl rand -hex 32

# Windows (PowerShell)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

> **Importante:** Se você não configurar `DATABASE_URL` ou deixá-la comentada, o projeto usará SQLite automaticamente. O banco será criado em `backend/database.db` na primeira execução.

### 2.5 Criar Tabelas do Banco de Dados

```bash
# Opção 1: Usar seeds (cria tabelas e dados de teste)
python -m app.seeds.seed_all

# Opção 2: Criar manualmente (se necessário)
# As tabelas são criadas automaticamente na primeira execução
```

### 2.6 Iniciar Servidor Backend

```bash
# Desenvolvimento (com reload automático)
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Ou usando Python diretamente
python -m uvicorn app.main:app --reload
```

**Verificar se está funcionando:**
- Acesse: http://127.0.0.1:8000
- Documentação Swagger: http://127.0.0.1:8000/docs
- Documentação ReDoc: http://127.0.0.1:8000/redoc

**Resposta esperada:**
```json
{
  "message": "API funcionando corretamente!"
}
```

---

## 🎨 Passo 3: Configurar Frontend

### 3.1 Navegar para o Diretório do Frontend

```bash
cd frontend
```

### 3.2 Instalar Dependências

```bash
npm install
```

**Dependências principais:**
- Next.js 16
- React 18
- TypeScript 5
- Tailwind CSS 4
- Zustand 5
- React Hook Form 7
- Zod 4
- Axios 1.13

### 3.3 Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na pasta `frontend/`:

```env
# API Backend
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

# Environment
NEXT_PUBLIC_ENVIRONMENT=development
```

### 3.4 Iniciar Servidor Frontend

```bash
# Desenvolvimento
npm run dev

# Ou
npm run dev -- -p 3000
```

**Verificar se está funcionando:**
- Acesse: http://localhost:3000
- A página inicial deve carregar

---

## ✅ Passo 4: Verificar Instalação

### 4.1 Verificar Backend

```bash
# Testar endpoint de saúde
curl http://127.0.0.1:8000/healthcheck

# Testar listagem de categorias (público)
curl http://127.0.0.1:8000/categorias
```

### 4.2 Verificar Frontend

- Abra http://localhost:3000 no navegador
- A página inicial deve exibir a busca de fornecedores

---

## 🧪 Passo 5: Testar Funcionalidades

### 5.1 Criar Conta de Usuário

1. Acesse: http://localhost:3000/register
2. Preencha o formulário:
   - Nome: João Silva
   - Email: joao@example.com
   - Senha: Senha123 (mínimo 8 caracteres, 1 maiúscula, 1 número)
   - Tipo: Cliente ou Fornecedor
3. Clique em "Registrar"
4. Você será redirecionado para a página de login

### 5.2 Fazer Login

1. Acesse: http://localhost:3000/login
2. Use as credenciais criadas
3. Após login, você será redirecionado para a página inicial

**Credenciais de Teste (se usar seeds):**
- Admin: `admin@eventsupplier.com` / `admin123`
- Cliente/Fornecedor: qualquer email / `senha123`

### 5.3 Testar Área Pública

#### Buscar Fornecedores
1. Na página inicial, use os filtros:
   - Cidade: São Paulo
   - Estado: SP
   - Categoria: Selecione uma categoria
   - Faixa de Preço: Selecione uma faixa
2. Clique em "Buscar"
3. Verifique se os fornecedores são listados

#### Visualizar Perfil de Fornecedor
1. Clique em um fornecedor na lista
2. Verifique se as informações são exibidas:
   - Dados do fornecedor
   - Galeria de mídia
   - Avaliações aprovadas
   - Formulário de contato

### 5.4 Testar Área do Cliente

#### Criar Avaliação
1. Faça login como cliente
2. Acesse um perfil de fornecedor
3. Clique em "Avaliar"
4. Preencha:
   - Rating: 1-5 estrelas
   - Comentário: mínimo 10 caracteres
5. Clique em "Enviar Avaliação"
6. A avaliação ficará pendente até aprovação do admin

### 5.5 Testar Área do Fornecedor

#### Criar Perfil de Fornecedor
1. Faça login como fornecedor
2. Acesse: http://localhost:3000/dashboard
3. Clique em "Criar Perfil de Fornecedor"
4. Preencha o formulário:
   - Nome Fantasia: Meu Evento Incrível
   - Descrição: Descrição detalhada (mínimo 50 caracteres)
   - Categoria: Selecione uma categoria
   - Cidade: São Paulo
   - Estado: SP
   - Telefone: (11) 98765-4321
   - Email: contato@meuevento.com
   - Faixa de Preço: Selecione
5. Clique em "Criar Fornecedor"

#### Editar Perfil
1. No dashboard, clique em "Editar Perfil"
2. Modifique os campos desejados
3. Clique em "Atualizar Fornecedor"

#### Gerenciar Mídia
1. Acesse: http://localhost:3000/dashboard/media
2. Clique em "Adicionar Mídia"
3. Preencha:
   - Tipo: Imagem, Vídeo ou Documento
   - URL: https://exemplo.com/imagem.jpg
4. Clique em "Adicionar"
5. Verifique os limites:
   - Máximo 20 imagens
   - Máximo 5 vídeos
   - Máximo 10 documentos

#### Gerenciar Formulário de Contato
1. Acesse: http://localhost:3000/dashboard/contact-form
2. Se não houver formulário, clique em "Criar Formulário"
3. Adicione questões:
   - Clique em "Adicionar Questão"
   - Preencha a pergunta
   - Selecione o tipo
   - Configure opções (se necessário)
   - Marque como obrigatória (se necessário)
4. Clique em "Salvar Alterações"
5. Teste resetar para template padrão

#### Visualizar Submissões
1. Acesse: http://localhost:3000/dashboard/submissions
2. Verifique se as submissões são listadas
3. Use os filtros (Todas, Não Lidas, Lidas)
4. Clique em uma submissão para ver detalhes
5. Marque como lida

### 5.6 Testar Área Administrativa

#### Fazer Login como Admin
1. Use as credenciais de admin:
   - Email: `admin@eventsupplier.com`
   - Senha: `admin123`
2. Acesse: http://localhost:3000/admin

#### Dashboard Admin
1. Verifique as métricas exibidas:
   - Total de usuários
   - Fornecedores ativos
   - Avaliações pendentes
   - Categorias ativas
   - Submissões

#### Moderar Avaliações
1. Acesse: http://localhost:3000/admin/reviews
2. Verifique as avaliações pendentes
3. Clique em uma avaliação para ver detalhes
4. Clique em "Aprovar" ou "Rejeitar"
5. Verifique se o status muda

#### Gerenciar Categorias
1. Acesse: http://localhost:3000/admin/categories
2. Clique em "Nova Categoria"
3. Preencha:
   - Nome: Nova Categoria
   - Ativa: Marque o checkbox
4. Clique em "Criar Categoria"
5. Teste editar uma categoria
6. Teste excluir uma categoria (verifique se há fornecedores usando)

#### Gerenciar Usuários
1. Acesse: http://localhost:3000/admin/users
2. Use os filtros (Todos, Clientes, Fornecedores, Admins)
3. Verifique a lista de usuários
4. Teste excluir um usuário (com confirmação)

---

## 🔍 Passo 6: Testar Validações e Regras de Negócio

### 6.1 Validação de Senha
- ✅ Teste senha muito curta (< 8 caracteres)
- ✅ Teste senha sem maiúscula
- ✅ Teste senha sem número
- ✅ Teste senha válida

### 6.2 Rate Limiting
- ✅ Tente fazer login 6 vezes em 15 minutos (deve bloquear)
- ✅ Tente criar 11 avaliações em 1 hora (deve bloquear)
- ✅ Tente submeter formulário 4 vezes em 1 hora (deve bloquear)

### 6.3 Validações de Fornecedor
- ✅ Tente criar fornecedor sem campos obrigatórios
- ✅ Tente criar fornecedor com telefone inválido
- ✅ Tente criar fornecedor com categoria inativa
- ✅ Tente criar segundo fornecedor (deve falhar - um por usuário)

### 6.4 Validações de Avaliação
- ✅ Tente criar avaliação sem comentário
- ✅ Tente criar avaliação com comentário < 10 caracteres
- ✅ Tente criar segunda avaliação para mesmo fornecedor (deve falhar)
- ✅ Tente editar avaliação após 24h (deve falhar para não-admin)

### 6.5 Validações de Formulário
- ✅ Tente adicionar mais de 20 questões
- ✅ Tente criar questão select sem opções
- ✅ Tente submeter formulário sem responder obrigatórias

### 6.6 Validações de Mídia
- ✅ Tente adicionar mais de 20 imagens
- ✅ Tente adicionar mais de 5 vídeos
- ✅ Tente adicionar mais de 10 documentos

---

## 🐛 Passo 7: Solução de Problemas Comuns

### Problema: Backend não inicia

**Sintomas:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Solução:**
```bash
# Verificar se o ambiente virtual está ativado
# Reinstalar dependências
pip install -r requirements.txt
```

### Problema: Erro de conexão com banco

**Sintomas:**
```
sqlalchemy.exc.OperationalError: ...
```

**Solução:**
1. **Se usando SQLite (padrão):**
   - Verifique se o arquivo `backend/database.db` pode ser criado
   - Verifique permissões de escrita na pasta `backend/`
   - Tente deletar `backend/database.db` e reiniciar o servidor

2. **Se usando PostgreSQL:**
   - Verificar se PostgreSQL está rodando:
     ```bash
     # Windows
     net start postgresql-x64-16
     
     # Linux/Mac
     sudo systemctl start postgresql
     ```
   - Verificar variável `DATABASE_URL` no `.env`
   - Verificar credenciais do banco

### Problema: Frontend não conecta ao backend

**Sintomas:**
```
Network Error ou CORS error
```

**Solução:**
1. Verificar se backend está rodando na porta 8000
2. Verificar `NEXT_PUBLIC_API_URL` no `.env.local`
3. Verificar `CORS_ORIGINS` no `.env` do backend

### Problema: Erro 401 Unauthorized

**Sintomas:**
```
401 Unauthorized em todas as requisições autenticadas
```

**Solução:**
1. Fazer logout e login novamente
2. Verificar se o token está sendo salvo no localStorage
3. Verificar se o token não expirou (24h)

### Problema: Erro 403 Forbidden

**Sintomas:**
```
403 Forbidden ao acessar rotas admin
```

**Solução:**
1. Verificar se o usuário tem tipo "admin"
2. Fazer login com conta de admin
3. Verificar proteção de rotas no frontend

### Problema: Tabelas não existem

**Sintomas:**
```
relation "users" does not exist
ou
no such table: users
```

**Solução:**
1. **As tabelas são criadas automaticamente** na primeira execução do servidor
2. Se as tabelas não foram criadas:
   ```bash
   # Executar seeds (cria tabelas e dados de teste)
   cd backend
   python -m app.seeds.seed_all
   ```
3. **Para resetar o banco SQLite:**
   ```bash
   # Deletar o arquivo do banco
   Remove-Item backend/database.db
   # Reiniciar o servidor - o banco será recriado
   ```

---

## 📊 Passo 8: Verificar Dados de Teste

### 8.1 Verificar no Banco de Dados SQLite

**Opção 1: Usando DB Browser for SQLite (Recomendado - Interface Visual)**

1. Baixe e instale: [DB Browser for SQLite](https://sqlitebrowser.org/)
2. Abra o arquivo `backend/database.db`
3. Navegue pelas tabelas e dados visualmente

**Opção 2: Usando Python**

```python
import sqlite3

# Conectar ao banco
conn = sqlite3.connect('backend/database.db')
cursor = conn.cursor()

# Verificar tabelas
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
print("Tabelas:", cursor.fetchall())

# Verificar usuários
cursor.execute("SELECT id, name, email, type FROM users LIMIT 5;")
print("Usuários:", cursor.fetchall())

# Verificar fornecedores
cursor.execute("SELECT id, fantasy_name, city, state FROM suppliers LIMIT 5;")
print("Fornecedores:", cursor.fetchall())

# Verificar categorias
cursor.execute("SELECT id, name, active FROM categories;")
print("Categorias:", cursor.fetchall())

conn.close()
```

**Opção 3: Usando linha de comando (se tiver sqlite3 instalado)**

```bash
# Windows (se tiver SQLite instalado)
sqlite3 backend/database.db

# No prompt do SQLite:
.tables                    # Listar tabelas
SELECT * FROM users;       # Ver usuários
.quit                     # Sair
```

### 8.2 Verificar via API

```bash
# Listar categorias
curl http://127.0.0.1:8000/categorias

# Listar fornecedores
curl http://127.0.0.1:8000/fornecedores

# Fazer login e obter token
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eventsupplier.com","password":"admin123"}'
```

---

## 🎯 Checklist de Teste Completo

### Backend
- [ ] Servidor inicia sem erros
- [ ] Banco de dados conecta corretamente
- [ ] Tabelas criadas corretamente
- [ ] Seeds executados com sucesso
- [ ] Swagger acessível em /docs
- [ ] Endpoints públicos funcionam
- [ ] Autenticação funciona
- [ ] Rate limiting funciona
- [ ] Validações funcionam

### Frontend
- [ ] Servidor inicia sem erros
- [ ] Página inicial carrega
- [ ] Conexão com backend funciona
- [ ] Autenticação funciona
- [ ] Rotas protegidas funcionam
- [ ] Busca de fornecedores funciona
- [ ] Visualização de perfil funciona
- [ ] Dashboard fornecedor funciona
- [ ] Painel admin funciona

### Funcionalidades
- [ ] Registro de usuário funciona
- [ ] Login funciona
- [ ] Criação de fornecedor funciona
- [ ] Edição de fornecedor funciona
- [ ] Criação de avaliação funciona
- [ ] Moderação de avaliação funciona
- [ ] Gestão de mídia funciona
- [ ] Gestão de formulário funciona
- [ ] Submissões funcionam
- [ ] Gestão de categorias funciona
- [ ] Gestão de usuários funciona

---

## 📝 Notas Importantes

1. **Ambiente de Desenvolvimento:**
   - Backend roda em: http://127.0.0.1:8000
   - Frontend roda em: http://localhost:3000
   - Banco de dados: SQLite (arquivo `backend/database.db`)
   - **Nota:** Para produção, recomenda-se usar PostgreSQL

2. **Credenciais Padrão (seeds):**
   - Admin: `admin@eventsupplier.com` / `admin123`
   - Clientes/Fornecedores: qualquer email / `senha123`

3. **Variáveis de Ambiente:**
   - Backend: arquivo `.env` na pasta `backend/`
   - Frontend: arquivo `.env.local` na pasta `frontend/`

4. **Logs:**
   - Backend: logs aparecem no terminal onde o servidor está rodando
   - Frontend: logs aparecem no terminal e no console do navegador

5. **Hot Reload:**
   - Backend: `--reload` flag no uvicorn
   - Frontend: automático com `npm run dev`

---

## 🚀 Próximos Passos Após Teste Local

1. **Testes Automatizados:**
   - Configurar testes E2E (Playwright/Cypress)
   - Expandir testes unitários

2. **Deploy:**
   - Preparar ambiente de produção
   - Configurar CI/CD
   - Deploy backend (Render/Railway)
   - Deploy frontend (Vercel)

3. **Monitoramento:**
   - Configurar logs estruturados
   - Configurar monitoramento de erros
   - Configurar métricas de performance

---

---

## 💡 Alternativa: Usar PostgreSQL (Opcional)

Se preferir usar PostgreSQL em vez de SQLite:

1. Instale o PostgreSQL: [Download](https://www.postgresql.org/download/)
2. Crie o banco de dados:
   ```bash
   psql -U postgres
   CREATE DATABASE events_supplier;
   ```
3. Configure no `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/events_supplier
   ```

> **Recomendação:** Use SQLite para desenvolvimento local (mais simples) e PostgreSQL para produção.

---

**Documento criado em:** Janeiro 2025  
**Última atualização:** Janeiro 2025 - Atualizado para SQLite  
**Status:** ✅ Completo e pronto para uso
