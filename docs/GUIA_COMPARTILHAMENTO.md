# 📤 Guia de Compartilhamento - Plataforma de Fornecedores de Eventos

**Versão:** 1.0  
**Data:** Fevereiro 2025

Este guia explica como compartilhar o projeto com outras pessoas para testar as funcionalidades.

---

## 🎯 Duas Opções de Compartilhamento

### ✅ **Opção 1: Instalação Local Automatizada (RECOMENDADA)**

A forma mais simples para alguém sem conhecimento técnico. Basta executar um script que faz tudo automaticamente.

**Pré-requisitos:**
- Windows 10/11 ou Linux/Mac
- Conexão com internet

**Passos:**
1. Compartilhe a pasta do projeto (via pendrive, Google Drive, etc.)
2. Execute o script de instalação (veja seção abaixo)
3. Execute o script de inicialização
4. Acesse http://localhost:3000 no navegador

**Tempo estimado:** 10-15 minutos

---

### ✅ **Opção 2: Deploy Online (Para Acesso Remoto)**

Publicar o projeto na internet para que qualquer pessoa possa acessar de qualquer lugar.

**Serviços Recomendados:**
- **Backend:** Render.com ou Railway.app (gratuito)
- **Frontend:** Vercel.com (gratuito e muito fácil)

**Tempo estimado:** 30-45 minutos

---

## 🚀 Opção 1: Instalação Local Automatizada

### Para Windows (PowerShell)

#### Passo 1: Instalar tudo automaticamente

1. Abra o PowerShell como Administrador
2. Navegue até a pasta do projeto:
   ```powershell
   cd C:\caminho\para\events-supplier
   ```
3. Execute o script de instalação:
   ```powershell
   .\install.ps1
   ```

O script irá:
- ✅ Verificar se Python e Node.js estão instalados
- ✅ Instalar Python e Node.js se necessário (via winget)
- ✅ Criar ambiente virtual Python
- ✅ Instalar todas as dependências do backend
- ✅ Instalar todas as dependências do frontend
- ✅ Configurar variáveis de ambiente
- ✅ Criar banco de dados com dados de teste

#### Passo 2: Iniciar o projeto

Execute o script de inicialização:
```powershell
.\start.ps1
```

Isso abrirá dois terminais:
- Um para o backend (porta 8000)
- Um para o frontend (porta 3000)

#### Passo 3: Acessar a aplicação

Abra seu navegador e acesse:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Documentação API:** http://localhost:8000/docs

**Credenciais de teste:**
- Admin: `admin@eventsupplier.com` / `admin123`
- Cliente/Fornecedor: qualquer email / `senha123`

---

### Para Linux/Mac

#### Passo 1: Instalar tudo automaticamente

1. Abra o Terminal
2. Navegue até a pasta do projeto:
   ```bash
   cd /caminho/para/events-supplier
   ```
3. Torne o script executável:
   ```bash
   chmod +x install.sh
   ```
4. Execute o script:
   ```bash
   ./install.sh
   ```

O script irá fazer tudo automaticamente (mesmo processo do Windows).

#### Passo 2: Iniciar o projeto

```bash
chmod +x start.sh
./start.sh
```

#### Passo 3: Acessar a aplicação

Mesmo processo do Windows acima.

---

## 🌐 Opção 2: Deploy Online (Acesso Remoto)

### Deploy do Backend (Render.com)

1. **Criar conta no Render.com:**
   - Acesse: https://render.com
   - Crie uma conta gratuita

2. **Criar novo Web Service:**
   - Clique em "New +" → "Web Service"
   - Conecte seu repositório Git (GitHub/GitLab)
   - Ou faça upload manual do código

3. **Configurar:**
   - **Name:** events-supplier-backend
   - **Environment:** Python 3
   - **Build Command:** `cd backend && pip install -r requirements.txt && python -m app.seeds.seed_all`
   - **Start Command:** `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Variáveis de Ambiente:**
   ```
   SECRET_KEY=sua_chave_secreta_aqui
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   CORS_ORIGINS=https://seu-frontend.vercel.app
   ENVIRONMENT=production
   ```
   (Não precisa configurar DATABASE_URL - SQLite funciona)

5. **Deploy:**
   - Clique em "Create Web Service"
   - Aguarde o deploy (5-10 minutos)
   - Anote a URL gerada (ex: https://events-supplier.onrender.com)

---

### Deploy do Frontend (Vercel.com)

1. **Criar conta no Vercel:**
   - Acesse: https://vercel.com
   - Crie uma conta gratuita (pode usar GitHub)

2. **Importar Projeto:**
   - Clique em "Add New" → "Project"
   - Conecte seu repositório Git
   - Ou faça upload da pasta `frontend/`

3. **Configurar:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

4. **Variáveis de Ambiente:**
   ```
   NEXT_PUBLIC_API_URL=https://seu-backend.onrender.com
   NEXT_PUBLIC_ENVIRONMENT=production
   ```

5. **Deploy:**
   - Clique em "Deploy"
   - Aguarde (2-5 minutos)
   - Anote a URL gerada (ex: https://events-supplier.vercel.app)

---

## 📋 Checklist de Compartilhamento

### Para Instalação Local:
- [ ] Python 3.12+ instalado
- [ ] Node.js 18+ instalado
- [ ] Scripts de instalação criados (`install.ps1` / `install.sh`)
- [ ] Scripts de inicialização criados (`start.ps1` / `start.sh`)
- [ ] Arquivo `.env` configurado no backend
- [ ] Arquivo `.env.local` configurado no frontend
- [ ] Banco de dados populado com dados de teste

### Para Deploy Online:
- [ ] Backend deployado e funcionando
- [ ] Frontend deployado e funcionando
- [ ] CORS configurado corretamente
- [ ] Variáveis de ambiente configuradas
- [ ] URLs compartilhadas com o testador

---

## 🆘 Solução de Problemas

### Erro: "Python não encontrado"
**Solução:** Instale Python 3.12+ de https://www.python.org/downloads/

### Erro: "Node.js não encontrado"
**Solução:** Instale Node.js 18+ de https://nodejs.org/

### Erro: "Porta 3000 já está em uso"
**Solução:** Feche outros programas que usam a porta 3000 ou altere a porta no frontend

### Erro: "Porta 8000 já está em uso"
**Solução:** Feche outros programas que usam a porta 8000 ou altere a porta no backend

### Erro: "CORS error" no navegador
**Solução:** Verifique se `CORS_ORIGINS` no `.env` do backend inclui a URL do frontend

### Erro: "Module not found"
**Solução:** Execute novamente `pip install -r requirements.txt` (backend) ou `npm install` (frontend)

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no terminal
2. Consulte o arquivo `docs/GUIA_TESTE_LOCAL.md` para mais detalhes
3. Verifique se todas as dependências estão instaladas

---

**Última atualização:** Fevereiro 2025
