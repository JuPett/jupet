# Deploy Ju Pet → Cloudflare Pages
# Uso: .\deploy.ps1
#
# O token NÃO fica neste arquivo (ele vai para o git). Fica em .env.deploy.ps1,
# que está no .gitignore. Se esse arquivo não existir, o script explica como criar.

$ErrorActionPreference = "Stop"

Write-Host "=== Deploy Ju Pet ===" -ForegroundColor Magenta

# ── 1. Credenciais ─────────────────────────────────────────────────────────────
$envFile = Join-Path $PSScriptRoot ".env.deploy.ps1"
if (Test-Path $envFile) { . $envFile }

if (-not $env:CLOUDFLARE_API_TOKEN -or -not $env:CLOUDFLARE_ACCOUNT_ID) {
  Write-Host "Faltam as credenciais do Cloudflare." -ForegroundColor Red
  Write-Host "Crie o arquivo .env.deploy.ps1 nesta pasta com:" -ForegroundColor Yellow
  Write-Host '  $env:CLOUDFLARE_API_TOKEN  = "..."' -ForegroundColor Gray
  Write-Host '  $env:CLOUDFLARE_ACCOUNT_ID = "..."' -ForegroundColor Gray
  exit 1
}

# ── 2. Commit do que estiver pendente ──────────────────────────────────────────
$dirty = git status --porcelain
if ($dirty) {
  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
  Write-Host "--- Commitando alterações pendentes..." -ForegroundColor Yellow
  git add -A
  git commit -m "deploy: $timestamp"
  if ($LASTEXITCODE -ne 0) { Write-Host "Commit falhou!" -ForegroundColor Red; exit 1 }
}
$sha = git rev-parse --short HEAD

# ── 3. Sanidade: o JS do index.html precisa estar sintaticamente válido ────────
# O app é um HTML único; um erro de sintaxe deixa a tela em branco no celular
# da Ju sem nenhum aviso. Melhor barrar aqui.
Write-Host "--- Checando o JavaScript..." -ForegroundColor Yellow
node -e "const fs=require('fs');const h=fs.readFileSync('index.html','utf8');const m=h.match(/<script>([\s\S]*?)<\/script>/);fs.writeFileSync('_check.js',m[1]);"
node --check _check.js
$jsOk = $LASTEXITCODE
Remove-Item _check.js -ErrorAction SilentlyContinue
if ($jsOk -ne 0) { Write-Host "JavaScript quebrado — deploy abortado!" -ForegroundColor Red; exit 1 }
node --check sw.js
if ($LASTEXITCODE -ne 0) { Write-Host "sw.js quebrado — deploy abortado!" -ForegroundColor Red; exit 1 }

# ── 4. Publicar ────────────────────────────────────────────────────────────────
Write-Host "--- Publicando no Cloudflare Pages..." -ForegroundColor Yellow
npx wrangler pages deploy $PSScriptRoot --project-name jupet --branch main --commit-dirty=true
if ($LASTEXITCODE -ne 0) { Write-Host "Deploy falhou!" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "=== Deploy concluído! ===" -ForegroundColor Green
Write-Host "Commit : $sha" -ForegroundColor Cyan
Write-Host "URL    : https://jupet.pages.dev" -ForegroundColor Cyan
