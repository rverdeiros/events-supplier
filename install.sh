#!/bin/bash
# Script de Instalação Automatizada - Linux/Mac
# Plataforma de Fornecedores de Eventos

echo "========================================"
echo "  INSTALAÇÃO AUTOMATIZADA"
echo "  Plataforma de Fornecedores de Eventos"
echo "========================================"
echo ""

# Verificar Python
echo "🔍 Verificando Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "✅ Python encontrado: $PYTHON_VERSION"
else
    echo "❌ Python não encontrado!"
    echo "💡 Por favor, instale Python 3.12+"
    echo "   Ubuntu/Debian: sudo apt install python3 python3-pip python3-venv"
    echo "   Mac: brew install python3"
    exit 1
fi

# Verificar Node.js
echo "🔍 Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js encontrado: $NODE_VERSION"
else
    echo "❌ Node.js não encontrado!"
    echo "💡 Por favor, instale Node.js 18+"
    echo "   Ubuntu/Debian: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt install -y nodejs"
    echo "   Mac: brew install node"
    exit 1
fi

echo ""
echo "📦 Instalando dependências do Backend..."

# Backend: Criar ambiente virtual
if [ ! -d "backend/venv" ]; then
    echo "  Criando ambiente virtual Python..."
    python3 -m venv backend/venv
fi

# Ativar ambiente virtual
echo "  Ativando ambiente virtual..."
source backend/venv/bin/activate

# Instalar dependências do backend
echo "  Instalando dependências Python..."
pip install -r backend/requirements.txt

# Criar arquivo .env se não existir
if [ ! -f "backend/.env" ]; then
    echo "  Criando arquivo .env..."
    SECRET_KEY=$(openssl rand -hex 32)
    cat > backend/.env << EOF
SECRET_KEY=$SECRET_KEY
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
ENVIRONMENT=development
EOF
    echo "  ✅ Arquivo .env criado com SECRET_KEY gerada automaticamente"
fi

# Popular banco de dados
echo "  Criando banco de dados e populando com dados de teste..."
cd backend
python -m app.seeds.seed_all
cd ..

echo ""
echo "📦 Instalando dependências do Frontend..."

# Frontend: Instalar dependências
cd frontend
echo "  Instalando dependências Node.js..."
npm install

# Criar arquivo .env.local se não existir
if [ ! -f ".env.local" ]; then
    echo "  Criando arquivo .env.local..."
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_ENVIRONMENT=development
EOF
    echo "  ✅ Arquivo .env.local criado"
fi

cd ..

echo ""
echo "========================================"
echo "  ✅ INSTALAÇÃO CONCLUÍDA!"
echo "========================================"
echo ""
echo "📋 Próximos passos:"
echo "  1. Execute: chmod +x start.sh && ./start.sh"
echo "  2. Acesse: http://localhost:3000"
echo ""
echo "🔑 Credenciais de teste:"
echo "  Admin: admin@eventsupplier.com / admin123"
echo "  Cliente: qualquer email / senha123"
echo ""
