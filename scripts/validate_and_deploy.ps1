Write-Host "--- CodeMe Academy Release Pipeline ---" -ForegroundColor Cyan

# 1. Environment Validation
Write-Host "1. Validating Environments..." -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File .\scripts\validate_environment.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host "DEPLOYMENT FAILED: Environment validation failed." -ForegroundColor Red
    exit 1
}

# 2. Frontend Linting
Write-Host "2. Running Frontend Linting..." -ForegroundColor Yellow
Push-Location frontend
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "DEPLOYMENT FAILED: ESLint/oxlint found issues." -ForegroundColor Red
    Pop-Location
    exit 1
}

# 3. Frontend Build Validation (TSC + Vite)
Write-Host "3. Validating Frontend Production Build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "DEPLOYMENT FAILED: Frontend compilation failed." -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# 4. Backend Validation
Write-Host "4. Running Backend Validation (Syntax Check)..." -ForegroundColor Yellow
Push-Location backend
python -m compileall app
if ($LASTEXITCODE -ne 0) {
    Write-Host "DEPLOYMENT FAILED: Backend Python syntax check failed." -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# 5. Live Health Check
Write-Host "5. Checking Backend Health..." -ForegroundColor Yellow
# In a real environment, you might deploy to a staging slot here and hit the health endpoint
# For MVP, we assume the health check will run post-deployment or during a blue-green swap.
Write-Host "Health Check Ping simulates..." -ForegroundColor Green

Write-Host "=============================================" -ForegroundColor Green
Write-Host "DEPLOYMENT SUCCESSFUL: All validation passed." -ForegroundColor Green
Write-Host "Proceeding with production rollout..." -ForegroundColor Green
exit 0

