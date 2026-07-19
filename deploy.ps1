# Deploy Ju Pet -> Cloudflare Pages
# Uso: .\deploy.ps1
#
# ATENCAO: manter este arquivo em ASCII puro (sem acentos e sem travessao).
# O Windows PowerShell 5.1 le .ps1 sem BOM como ANSI e acentua errado, o que ja
# quebrou o parser uma vez.
#
# O token NAO fica aqui (este arquivo vai para o git). Fica em .env.deploy.ps1,
# que esta no .gitignore.

$ErrorActionPreference = "Stop"

Write-Host "=== Deploy Ju Pet ===" -ForegroundColor Magenta

# -- 1. Credenciais ------------------------------------------------------------
$envFile = Join-Path $PSScriptRoot ".env.deploy.ps1"
if (Test-Path $envFile) { . $envFile }

if (-not $env:CLOUDFLARE_API_TOKEN -or -not $env:CLOUDFLARE_ACCOUNT_ID) {
  Write-Host "Faltam as credenciais do Cloudflare." -ForegroundColor Red
  Write-Host "Crie o arquivo .env.deploy.ps1 nesta pasta com:" -ForegroundColor Yellow
  Write-Host '  $env:CLOUDFLARE_API_TOKEN  = "..."' -ForegroundColor Gray
  Write-Host '  $env:CLOUDFLARE_ACCOUNT_ID = "..."' -ForegroundColor Gray
  exit 1
}

# -- 2. Carimbar a versao no service worker ------------------------------------
# Se o sw.js nao muda nenhum byte, o navegador nem verifica se ha versao nova e o
# celular da Ju fica preso no app antigo para sempre (aconteceu em 19/07/2026).
# Carimbar aqui garante que TODO deploy invalida o cache. Nao remover.
# Le e escreve via .NET com UTF-8 SEM BOM. O Get-Content/Set-Content do
# PowerShell 5.1 le como ANSI e corrompe acentos (ja aconteceu).
$swPath = Join-Path $PSScriptRoot "sw.js"
$versao = Get-Date -Format "yyyy-MM-dd-HHmmss"   # segundos: dois deploys no mesmo minuto sao versoes distintas
$utf8SemBom = New-Object System.Text.UTF8Encoding $false
$sw = [System.IO.File]::ReadAllText($swPath, $utf8SemBom)

# Checar a EXISTENCIA do padrao antes de substituir. Comparar o antes/depois
# confunde "padrao nao encontrado" com "versao igual" e aborta o deploy a toa.
if ($sw -notmatch "const VERSAO = '[^']*';") {
  Write-Host "Nao achei a linha VERSAO no sw.js - deploy abortado!" -ForegroundColor Red
  Write-Host "Sem o carimbo, a atualizacao nao chega no celular da Ju." -ForegroundColor Yellow
  exit 1
}
$swNovo = [regex]::Replace($sw, "const VERSAO = '[^']*';", "const VERSAO = '$versao';")
[System.IO.File]::WriteAllText($swPath, $swNovo, $utf8SemBom)
Write-Host "--- Versao do service worker: $versao" -ForegroundColor Green

# -- 3. Sanidade do codigo -----------------------------------------------------
# O app e um HTML unico: erro de sintaxe = tela branca no celular, sem aviso.
Write-Host "--- Checando o codigo..." -ForegroundColor Yellow
node (Join-Path $PSScriptRoot "checar-js.js")
if ($LASTEXITCODE -ne 0) {
  Write-Host "Codigo quebrado - deploy abortado!" -ForegroundColor Red
  exit 1
}

# -- 4. Commit do que estiver pendente -----------------------------------------
# git escreve avisos no stderr (ex: "LF will be replaced by CRLF") e, com
# ErrorActionPreference=Stop, isso aborta o script sem nada estar errado.
# Por isso os comandos git rodam com Continue e a checagem e pelo exit code.
$ErrorActionPreference = "Continue"
$dirty = git status --porcelain
if ($dirty) {
  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
  Write-Host "--- Commitando alteracoes pendentes..." -ForegroundColor Yellow
  git add -A 2>&1 | Out-Null
  git commit -m "deploy: $timestamp" 2>&1 | Out-String | Write-Host
  if ($LASTEXITCODE -ne 0) { Write-Host "Commit falhou!" -ForegroundColor Red; exit 1 }
}
$sha = git rev-parse --short HEAD
$ErrorActionPreference = "Stop"

# -- 5. Publicar ---------------------------------------------------------------
Write-Host "--- Publicando no Cloudflare Pages..." -ForegroundColor Yellow
npx wrangler pages deploy $PSScriptRoot --project-name jupet --branch main --commit-dirty=true
if ($LASTEXITCODE -ne 0) { Write-Host "Deploy falhou!" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "=== Deploy concluido! ===" -ForegroundColor Green
Write-Host "Commit : $sha"    -ForegroundColor Cyan
Write-Host "Versao : $versao" -ForegroundColor Cyan
Write-Host "URL    : https://jupet.pages.dev" -ForegroundColor Cyan
