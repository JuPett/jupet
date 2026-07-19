// Valida a sintaxe do JavaScript embutido no index.html.
// Rodado pelo deploy.ps1 ANTES de publicar: como o app e um HTML unico, um erro
// de sintaxe deixa a tela em branco no celular da Ju, sem nenhuma mensagem.
//
// Uso: node checar-js.js   (sai com codigo 1 se algo estiver quebrado)

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const raiz = __dirname;
let erros = 0;

function falhar(msg) {
  console.error('  ERRO: ' + msg);
  erros++;
}

// ── paginas HTML: extrai e valida cada bloco <script> + ids orfaos ────────────
for (const pagina of ['index.html', 'agendar.html']) {
  const html = fs.readFileSync(path.join(raiz, pagina), 'utf8');
  const blocos = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)];

  if (!blocos.length) {
    falhar(`nenhum bloco <script> encontrado no ${pagina}`);
  } else {
    blocos.forEach((b, i) => {
      try {
        new vm.Script(b[1], { filename: `${pagina} <script #${i + 1}>` });
        console.log(`  ${pagina} <script #${i + 1}>: OK (${b[1].length} chars)`);
      } catch (e) {
        falhar(`${pagina} <script #${i + 1}>: ${e.message}`);
      }
    });
  }

  // ids usados no JS que nao existem no HTML — erro de digitacao que so
  // apareceria em runtime, na mao da Ju.
  const usados = [...html.matchAll(/getElementById\('([^']+)'\)/g)].map(m => m[1]);
  const definidos = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
  const orfaos = [...new Set(usados)].filter(u => !definidos.has(u));
  if (orfaos.length) falhar(`${pagina}: getElementById aponta para ids que nao existem: ` + orfaos.join(', '));
  else console.log(`  ${pagina} ids do getElementById: OK`);
}

// ── arquivos soltos ───────────────────────────────────────────────────────────
for (const arq of ['sw.js']) {
  try {
    new vm.Script(fs.readFileSync(path.join(raiz, arq), 'utf8'), { filename: arq });
    console.log(`  ${arq}: OK`);
  } catch (e) {
    falhar(`${arq}: ${e.message}`);
  }
}

try {
  JSON.parse(fs.readFileSync(path.join(raiz, 'manifest.json'), 'utf8'));
  console.log('  manifest.json: OK');
} catch (e) {
  falhar('manifest.json: ' + e.message);
}

// ── o carimbo de versao do service worker tem que existir ─────────────────────
const sw = fs.readFileSync(path.join(raiz, 'sw.js'), 'utf8');
if (!/const VERSAO = '[^']+';/.test(sw)) {
  falhar('sw.js sem a linha "const VERSAO" — sem ela a atualizacao nao chega no celular');
} else {
  console.log('  carimbo de versao do sw.js: ' + sw.match(/const VERSAO = '([^']+)';/)[1]);
}

process.exit(erros ? 1 : 0);
