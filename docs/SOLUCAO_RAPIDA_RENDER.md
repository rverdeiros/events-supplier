# ⚡ Solução Rápida - Erros de Deploy no Render

## 🎯 Ações Imediatas

### 1️⃣ Verificar Conexão GitHub no Render (5 minutos)

1. Acesse: https://dashboard.render.com
2. Vá em **Settings** → **GitHub** (ou **Account Settings** → **GitHub**)
3. Verifique se aparece "Connected" ao lado do GitHub
4. Se não estiver conectado:
   - Clique em **Connect GitHub**
   - Autorize o Render a acessar seus repositórios
   - Selecione o repositório `events-supplier` nas permissões

### 2️⃣ Recriar o Serviço no Render (10 minutos)

**IMPORTANTE:** Se você já tem um serviço criado, delete-o primeiro!

1. No dashboard do Render, vá em **Dashboard**
2. Encontre o serviço que está falhando
3. Clique nos **3 pontos** → **Delete**
4. Confirme a exclusão

**Agora crie um novo:**

1. Clique em **New +** → **Web Service**
2. **NÃO** cole a URL manualmente
3. Clique em **Connect GitHub** (ou selecione o repositório da lista)
4. Escolha: `rverdeiros/events-supplier`
5. Configure:

   ```
   Name: events-supplier-backend
   Region: Oregon (ou mais próximo de você)
   Branch: main (ou master, dependendo da sua branch)
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

6. Clique em **Advanced** e adicione as variáveis de ambiente:
   ```
   SECRET_KEY=<clique em "Generate" para gerar automaticamente>
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   ENVIRONMENT=production
   CORS_ORIGINS=https://seu-frontend.vercel.app
   ```
   (Substitua `seu-frontend.vercel.app` pela URL real do seu frontend)

7. Clique em **Create Web Service**

### 3️⃣ Aguardar e Verificar (5-10 minutos)

1. O Render vai tentar clonar o repositório
2. Se ainda der erro 500/503/502:
   - Aguarde 10-15 minutos
   - Verifique: https://www.githubstatus.com/
   - Se o GitHub estiver com problemas, aguarde a resolução

### 4️⃣ Verificar Logs

1. No dashboard do serviço, vá em **Logs**
2. Procure por erros específicos
3. Se aparecer "Unable to clone", volte ao passo 1

## ✅ Configuração Correta Esperada

### Root Directory
```
backend
```
⚠️ **CRÍTICO:** Deve ser `backend` (não vazio, não `/`, não `backend/`)

### Build Command
```bash
pip install -r requirements.txt
```

### Start Command
```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Variáveis de Ambiente Mínimas
- `SECRET_KEY` (gerar automaticamente)
- `ACCESS_TOKEN_EXPIRE_MINUTES=1440`
- `ENVIRONMENT=production`
- `CORS_ORIGINS` (URL do seu frontend)

## 🚨 Erros Comuns e Soluções

### "Unable to clone repository"
→ **Solução:** Verificar conexão GitHub no Render (Passo 1)

### "No such file or directory: /opt/render/project/src"
→ **Solução:** Root Directory não configurado. Deve ser `backend`

### "Module not found: app"
→ **Solução:** Root Directory deve ser `backend` (não vazio)

### "Port already in use"
→ **Solução:** Use `$PORT` no Start Command (não um número fixo)

## 📞 Próximos Passos

Se após seguir todos os passos o problema persistir:

1. Verifique se o repositório está público (ou se o Render tem acesso)
2. Tente fazer um commit novo e force um redeploy
3. Considere usar Railway.app como alternativa temporária
4. Entre em contato com suporte do Render

## 🔗 Links Úteis

- Dashboard Render: https://dashboard.render.com
- Status GitHub: https://www.githubstatus.com/
- Documentação Render: https://render.com/docs
