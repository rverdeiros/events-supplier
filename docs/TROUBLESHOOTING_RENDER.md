# 🔧 Troubleshooting - Erros de Deploy no Render

## ❌ Erro: "Unable to clone repository" (500, 503, 502)

### Problema
O Render está tentando clonar o repositório do GitHub mas está recebendo erros do servidor:
- `error: 500` - Internal Server Error
- `error: 503` - Service Unavailable  
- `error: 502` - Bad Gateway
- `Transferred a partial file` - Transferência incompleta

### 🔍 Possíveis Causas

1. **Problemas temporários do GitHub**
   - O GitHub pode estar com problemas de infraestrutura
   - Pode ser um problema de rede entre Render e GitHub

2. **Repositório privado sem acesso configurado**
   - O Render precisa ter acesso ao repositório
   - Se o repositório é privado, precisa conectar a conta GitHub ao Render

3. **Problemas de autenticação**
   - Token de acesso expirado ou inválido
   - Permissões insuficientes

### ✅ Soluções

#### Solução 1: Verificar Acesso ao Repositório (RECOMENDADO)

1. **No Dashboard do Render:**
   - Vá em **Settings** → **GitHub**
   - Verifique se sua conta GitHub está conectada
   - Se não estiver, clique em **Connect GitHub** e autorize o acesso

2. **Verificar se o repositório está acessível:**
   - Acesse: `https://github.com/rverdeiros/events-supplier`
   - Verifique se o repositório existe e está acessível
   - Se for privado, certifique-se de que o Render tem acesso

#### Solução 2: Reconfigurar o Serviço no Render

1. **Deletar o serviço atual** (se existir)
   - Vá no dashboard do Render
   - Encontre o serviço que está falhando
   - Delete o serviço

2. **Criar novo serviço:**
   - Clique em **New +** → **Web Service**
   - Selecione **Connect GitHub** (não use URL manual)
   - Escolha o repositório `rverdeiros/events-supplier`
   - Configure:
     - **Name:** `events-supplier-backend`
     - **Root Directory:** `backend` (IMPORTANTE!)
     - **Environment:** `Python 3`
     - **Build Command:** `pip install -r requirements.txt`
     - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

#### Solução 3: Usar Deploy Manual (Alternativa)

Se o problema persistir, você pode fazer deploy manual:

1. **Fazer build local:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Criar arquivo ZIP do backend:**
   - Compacte apenas a pasta `backend/` (sem venv, sem __pycache__)
   - Certifique-se de incluir todos os arquivos necessários

3. **No Render:**
   - Crie um novo serviço
   - Escolha **Manual Deploy**
   - Faça upload do ZIP

#### Solução 4: Verificar Status do GitHub

1. Acesse: https://www.githubstatus.com/
2. Verifique se há incidentes reportados
3. Se houver problemas, aguarde a resolução

### 🔧 Configuração Recomendada no Render

#### Variáveis de Ambiente:
```
SECRET_KEY=<gerar automaticamente ou usar uma chave forte>
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ENVIRONMENT=production
CORS_ORIGINS=https://seu-frontend.vercel.app,https://seu-frontend.onrender.com
```

#### Build Command:
```bash
pip install -r requirements.txt
```

#### Start Command:
```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

#### Root Directory:
```
backend
```

### ⚠️ Erro: "No such file or directory: /opt/render/project/src"

Este erro acontece porque o clone falhou. O Render tenta fazer `cd` para um diretório que não existe porque o repositório não foi clonado.

**Solução:** Resolva primeiro o problema de clone (Soluções 1-4 acima). Depois que o repositório for clonado com sucesso, este erro desaparecerá.

### 📋 Checklist de Verificação

- [ ] Conta GitHub conectada ao Render
- [ ] Repositório existe e está acessível
- [ ] Se repositório é privado, Render tem acesso
- [ ] Root Directory configurado como `backend`
- [ ] Build Command correto
- [ ] Start Command correto
- [ ] Variáveis de ambiente configuradas
- [ ] GitHub Status está operacional

### 🆘 Se Nada Funcionar

1. **Tente novamente após algumas horas** (pode ser problema temporário do GitHub)
2. **Use Railway.app como alternativa** (outro serviço de deploy gratuito)
3. **Verifique logs completos** no dashboard do Render para mais detalhes
4. **Entre em contato com o suporte do Render** se o problema persistir

### 📚 Recursos Úteis

- [Documentação Render](https://render.com/docs)
- [Status do GitHub](https://www.githubstatus.com/)
- [Guia de Deploy do Render](https://render.com/docs/deploy-fastapi)
