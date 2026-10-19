# Quick Build Test Script for Windows PowerShell
# Run this before deploying to catch any build errors

Write-Host "🔍 Testing NileMart Frontend Build..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-Not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from the frontend directory" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔨 Running production build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Build failed! Fix errors above before deploying." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Build successful! Ready to deploy! 🚀" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. git add ." -ForegroundColor White
Write-Host "2. git commit -m 'Fix: ESLint errors and performance optimization'" -ForegroundColor White
Write-Host "3. git push" -ForegroundColor White
Write-Host "4. Deploy on Render/Vercel" -ForegroundColor White
