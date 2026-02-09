#!/bin/bash
# Script de Inicialização - Linux/Mac
# Inicia backend e frontend

echo "🚀 Iniciando aplicação..."
echo ""

# Verificar se o ambiente virtual existe
if [ ! -d "backend/venv" ]; then
    echo "❌ Ambiente virtual não encontrado!"
    echo "💡 Execute primeiro: ./install.sh"
    exit 1
fi

# Função para limpar processos ao sair
cleanup() {
    echo ""
    echo "🛑 Parando servidores..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Iniciar backend
echo "📡 Iniciando Backend (porta 8000)..."
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
cd ..

# Aguardar backend iniciar
sleep 3

# Iniciar frontend
echo "🎨 Iniciando Frontend (porta 3000)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Aplicação iniciada!"
echo ""
echo "📋 Acesse:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:8000"
echo "  Documentação: http://localhost:8000/docs"
echo ""
echo "💡 Pressione Ctrl+C para parar"
echo ""

# Aguardar processos
wait
