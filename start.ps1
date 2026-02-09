# Script de Inicialização - Windows
# Inicia backend e frontend em terminais separados

Write-Host "🚀 Iniciando aplicação..." -ForegroundColor Cyan
Write-Host ""

# Verificar se o ambiente virtual existe
if (-not (Test-Path "backend\venv")) {
    Write-Host "❌ Ambiente virtual não encontrado!" -ForegroundColor Red
    Write-Host "💡 Execute primeiro: .\install.ps1" -ForegroundColor Yellow
    exit 1
}

# Iniciar backend em novo terminal
Write-Host "📡 Iniciando Backend (porta 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; .\venv\Scripts\Activate.ps1; Write-Host '🚀 Backend iniciando...' -ForegroundColor Green; uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

# Aguardar um pouco para o backend iniciar
Start-Sleep -Seconds 3

# Iniciar frontend em novo terminal
Write-Host "🎨 Iniciando Frontend (porta 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host '🚀 Frontend iniciando...' -ForegroundColor Green; npm run dev"

Write-Host ""
Write-Host "✅ Aplicação iniciada!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Acesse:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "  Documentação: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "💡 Para parar, feche as janelas do PowerShell" -ForegroundColor Yellow
Write-Host ""
