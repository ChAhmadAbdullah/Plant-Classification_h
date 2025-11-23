# Quick Setup Script for Plant Classification App
# Run this script from the Plant-Classification_h root directory

Write-Host "🌿 Plant Classification - Quick Setup Script" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Cyan

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check Python
try {
    $pythonVersion = python --version
    Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install from https://python.org/" -ForegroundColor Red
    exit 1
}

# Check Git
try {
    $gitVersion = git --version
    Write-Host "✅ Git: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Git not found (optional for development)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📁 Checking project structure..." -ForegroundColor Cyan

# Check if model file exists
$modelFile = "backend\ml_model\plant_disease_resnet50.pth"
if (Test-Path $modelFile) {
    $fileSize = (Get-Item $modelFile).Length / 1MB
    Write-Host "✅ ML Model found ($([math]::Round($fileSize, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "⚠️  ML Model not found at: $modelFile" -ForegroundColor Yellow
    Write-Host "   Attempting to copy from Plant-Classification folder..." -ForegroundColor Yellow
    
    $sourceModel = "..\Plant-Classification\plant_disease_resnet50.pth"
    if (Test-Path $sourceModel) {
        Write-Host "   Copying model file (this may take a moment)..." -ForegroundColor Yellow
        Copy-Item $sourceModel $modelFile
        Write-Host "✅ Model file copied successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Model file not found at: $sourceModel" -ForegroundColor Red
        Write-Host "   Please manually copy plant_disease_resnet50.pth to backend\ml_model\" -ForegroundColor Red
        Write-Host "   Then run this script again." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan

# Install backend dependencies
Write-Host ""
Write-Host "Installing backend (Node.js) dependencies..." -ForegroundColor Yellow
Push-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend npm install failed" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green

# Install frontend dependencies
Write-Host ""
Write-Host "Installing frontend (React) dependencies..." -ForegroundColor Yellow
Push-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend npm install failed" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green

# Install Python dependencies
Write-Host ""
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
Write-Host "   This may take several minutes for PyTorch..." -ForegroundColor Yellow

# Check if PyTorch is already installed
$torchInstalled = python -c "import torch; print('installed')" 2>$null
if ($torchInstalled -eq "installed") {
    Write-Host "✅ PyTorch already installed" -ForegroundColor Green
} else {
    Write-Host "   Installing PyTorch (CPU version)..." -ForegroundColor Yellow
    pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ PyTorch installation failed" -ForegroundColor Red
        Write-Host "   Try manually: pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ PyTorch installed" -ForegroundColor Green
}

Write-Host "   Installing other Python packages..." -ForegroundColor Yellow
pip install -r backend\ml_model\requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Some Python packages may have failed to install" -ForegroundColor Yellow
} else {
    Write-Host "✅ Python dependencies installed" -ForegroundColor Green
}

# Check for .env file
Write-Host ""
Write-Host "⚙️  Checking environment configuration..." -ForegroundColor Cyan
$envFile = "backend\.env"
if (Test-Path $envFile) {
    Write-Host "✅ .env file exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file not found" -ForegroundColor Yellow
    Write-Host "   Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" $envFile
    Write-Host "✅ .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit backend\.env and configure:" -ForegroundColor Yellow
    Write-Host "   - MONGODB_URI (database connection)" -ForegroundColor Yellow
    Write-Host "   - JWT_SECRET (authentication secret)" -ForegroundColor Yellow
    Write-Host "   - HF_TOKEN (Hugging Face API token)" -ForegroundColor Yellow
    Write-Host "   - GROQ_APIKEY (optional)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🧪 Testing ML model..." -ForegroundColor Cyan
$testResult = python -c "import sys; sys.path.append('backend/ml_model'); from model import predict_image; print('OK')" 2>$null
if ($testResult -eq "OK") {
    Write-Host "✅ ML model can be loaded" -ForegroundColor Green
} else {
    Write-Host "⚠️  ML model test failed (may work when server starts)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Configure environment variables:" -ForegroundColor White
Write-Host "   Edit: backend\.env" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Start MongoDB:" -ForegroundColor White
Write-Host "   mongod" -ForegroundColor Yellow
Write-Host "   (or use MongoDB Atlas)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Start the backend server (Terminal 1):" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Yellow
Write-Host "   npm start" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Start the frontend (Terminal 2):" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. Open browser:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 For detailed instructions, see:" -ForegroundColor Cyan
Write-Host "   - VSCODE_SETUP_GUIDE.md (Complete setup)" -ForegroundColor White
Write-Host "   - README.md (Full documentation)" -ForegroundColor White
Write-Host "   - GIT_MERGE_GUIDE.md (Git integration)" -ForegroundColor White
Write-Host ""
Write-Host "Need help? Check the troubleshooting section in VSCODE_SETUP_GUIDE.md" -ForegroundColor Gray
Write-Host ""
