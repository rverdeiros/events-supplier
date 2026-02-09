# Script de Instalação Automatizada - Windows
# Plataforma de Fornecedores de Eventos

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INSTALAÇÃO AUTOMATIZADA" -ForegroundColor Cyan
Write-Host "  Plataforma de Fornecedores de Eventos" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está executando como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  AVISO: Execute como Administrador para instalar Python/Node.js automaticamente" -ForegroundColor Yellow
    Write-Host ""
}

# Função para verificar se um comando existe
function Test-Command {
    param($command)
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Verificar Python
Write-Host "🔍 Verificando Python..." -ForegroundColor Yellow
if (Test-Command python) {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python encontrado: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Python não encontrado!" -ForegroundColor Red
    if ($isAdmin) {
        Write-Host "📥 Instalando Python via winget..." -ForegroundColor Yellow
        winget install Python.Python.3.12
        Write-Host "✅ Python instalado! Por favor, reinicie o PowerShell e execute este script novamente." -ForegroundColor Green
        exit
    } else {
        Write-Host "💡 Por favor, instale Python 3.12+ de https://www.python.org/downloads/" -ForegroundColor Yellow
        exit 1
    }
}

# Verificar Node.js
Write-Host "🔍 Verificando Node.js..." -ForegroundColor Yellow
if (Test-Command node) {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js não encontrado!" -ForegroundColor Red
    if ($isAdmin) {
        Write-Host "📥 Instalando Node.js via winget..." -ForegroundColor Yellow
        winget install OpenJS.NodeJS.LTS
        Write-Host "✅ Node.js instalado! Por favor, reinicie o PowerShell e execute este script novamente." -ForegroundColor Green
        exit
    } else {
        Write-Host "💡 Por favor, instale Node.js 18+ de https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "📦 Instalando dependências do Backend..." -ForegroundColor Cyan

# Backend: Criar ambiente virtual
if (-not (Test-Path "backend\venv")) {
    Write-Host "  Criando ambiente virtual Python..." -ForegroundColor Yellow
    python -m venv backend\venv
}

# Ativar ambiente virtual e executar comandos dentro dele
Write-Host "  Ativando ambiente virtual..." -ForegroundColor Yellow
$venvPython = "backend\venv\Scripts\python.exe"
$venvPip = "backend\venv\Scripts\pip.exe"

# Instalar dependências do backend
Write-Host "  Instalando dependências Python..." -ForegroundColor Yellow
& $venvPip install -r backend\requirements.txt

# Criar arquivo .env se não existir
if (-not (Test-Path "backend\.env")) {
    Write-Host "  Criando arquivo .env..." -ForegroundColor Yellow
    $secretKey = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    @"
SECRET_KEY=$secretKey
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
ENVIRONMENT=development
"@ | Out-File -FilePath "backend\.env" -Encoding utf8
    Write-Host "  ✅ Arquivo .env criado com SECRET_KEY gerada automaticamente" -ForegroundColor Green
}

# Popular banco de dados
Write-Host "  Criando banco de dados e populando com dados de teste..." -ForegroundColor Yellow
Set-Location backend
& $venvPython -m app.seeds.seed_all
Set-Location ..

Write-Host ""
Write-Host "📦 Instalando dependências do Frontend..." -ForegroundColor Cyan

# Frontend: Instalar dependências
Set-Location frontend
Write-Host "  Instalando dependências Node.js..." -ForegroundColor Yellow
npm install

# Criar arquivo .env.local se não existir
if (-not (Test-Path ".env.local")) {
    Write-Host "  Criando arquivo .env.local..." -ForegroundColor Yellow
    @"
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_ENVIRONMENT=development
"@ | Out-File -FilePath ".env.local" -Encoding utf8
    Write-Host "  ✅ Arquivo .env.local criado" -ForegroundColor Green
}

Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ INSTALAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "  1. Execute: .\start.ps1" -ForegroundColor White
Write-Host "  2. Acesse: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Credenciais de teste:" -ForegroundColor Cyan
Write-Host "  Admin: admin@eventsupplier.com / admin123" -ForegroundColor White
Write-Host "  Cliente: qualquer email / senha123" -ForegroundColor White
Write-Host ""
