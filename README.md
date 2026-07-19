# Ju Pet — App de Gestão

App de banho & tosa da Ju Pet (Acupe de Brotas, Salvador-BA). PWA instalável.

- **No ar:** https://jupet.pages.dev
- **Manual:** https://jupet.pages.dev/manual.html

## O que é

HTML único, sem build, sem servidor, sem login. Todos os dados vivem no
`localStorage` do navegador do celular da Ju. É proposital: uma pessoa, um
aparelho, sem mensalidade, funciona offline.

**A contrapartida disso é séria:** os dados existem em um lugar só. Trocar de
celular, limpar o navegador ou (no iPhone) desinstalar o app apaga tudo. Por
isso o backup dentro do app não é um extra — é o que segura o negócio.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | O app inteiro (HTML + CSS + JS) |
| `manual.html` | Manual de uso para a Ju |
| `manifest.json` · `sw.js` | O que torna o app instalável e utilizável offline |
| `icon-*.png` | Ícones da tela inicial |
| `deploy.ps1` | Publica no Cloudflare Pages |

## Deploy

```powershell
.\deploy.ps1
```

Precisa de `.env.deploy.ps1` na raiz (fora do git) com:

```powershell
$env:CLOUDFLARE_API_TOKEN  = "..."
$env:CLOUDFLARE_ACCOUNT_ID = "..."
```

O script valida a sintaxe do JavaScript antes de publicar. Como é um HTML
único, um erro de sintaxe deixa a tela **em branco** no celular da Ju sem
nenhuma mensagem — daí a checagem ser obrigatória.

## Cuidados ao editar

- **Foto de pet sempre passa por `comprimirFoto()`.** A foto crua da câmera tem
  ~750 KB em base64 e o `localStorage` inteiro tem ~5 MB. Sem comprimir, o app
  para de salvar depois de poucos cadastros.
- **`DB.set` avisa quando falha e devolve `true`/`false`.** Não voltar para o
  `catch(e){}` vazio: gravação falhando em silêncio é pior que erro na cara.
- **Não mover para o OneDrive.** O projeto saiu de lá justamente para não
  correr risco de conflito de sincronização.

## Pendências conhecidas

1. Não dá para **editar** cliente, pet ou lançamento já salvo — só criar e apagar.
2. **Preço não varia por porte** — falta a tabela real da Ju.
3. Despesas fixas (R$ 5.280) **fixas no código**, repetidas em 5 lugares.
4. Apagar cliente deixa os atendimentos dele órfãos no financeiro.
5. Break-even ignora as despesas variáveis já lançadas — sai otimista.

## Já corrigido

- Backup/restauração, compressão de foto e gravação que avisa quando falha (19/07)
- Agendamento passa a **escolher** o cliente cadastrado, com vínculo por id
- Idade do pet calculada a partir do nascimento
- Concluir atendimento pela agenda, com carimbo de fidelidade automático
- Receita em dobro barrada; aniversário no dia certo; fuso após as 21h
- Atualização do app chega ao celular (o `sw.js` é carimbado a cada deploy)
