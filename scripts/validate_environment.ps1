Write-Host "Validating Environment Variables..." -ForegroundColor Cyan

$envFile = "backend/.env"
if (-Not (Test-Path $envFile)) {
    Write-Host "CRITICAL: backend/.env is missing!" -ForegroundColor Red
    exit 1
}

$requiredKeys = @("SUPABASE_PROJECT_URL", "GROQ_API_KEYS", "DATABASE_URL")
$envContent = Get-Content $envFile

foreach ($key in $requiredKeys) {
    $found = $envContent | Select-String -Pattern "^$key="
    if (-Not $found) {
        Write-Host "CRITICAL: Missing required environment variable $key in $envFile" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Environment Validation Passed." -ForegroundColor Green
exit 0

