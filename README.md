# Ju Pet — App de Gestão

App de banho & tosa da Ju Pet (Acupe de Brotas, Salvador-BA). PWA instalável.

- **No ar (app da Ju):** https://jupet.pages.dev
- **Agendamento (link do cliente):** https://jupet.pages.dev/agendar
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
   (Produto já pode ser editado.)
2. **Preço de serviço não varia por porte** — falta a tabela real da Ju.
3. Despesas fixas ainda são **valores fixos no código** (agora num lugar só,
   `DESPESAS_FIXAS`) — falta uma tela para a Ju editar sozinha.
4. Apagar cliente deixa os atendimentos dele órfãos no financeiro.
5. O Recibo não inclui produto vendido — a venda é lançada pela tela de Estoque.
6. A página de agendamento **não mostra os horários já ocupados** (a agenda vive só
   no celular da Ju). É pedido sujeito a confirmação, por escolha de arquitetura.
   Resolver isso exige backend — decisão adiada de propósito até o uso justificar.
7. Horário de funcionamento está fixo no `agendar.html` — falta tela de configuração.

## Já corrigido

- Backup/restauração, compressão de foto e gravação que avisa quando falha (19/07)
- Agendamento passa a **escolher** o cliente cadastrado, com vínculo por id
- Idade do pet calculada a partir do nascimento
- Concluir atendimento pela agenda, com carimbo de fidelidade automático
- Receita em dobro barrada; aniversário no dia certo; fuso após as 21h
- Atualização do app chega ao celular (o `sw.js` é carimbado a cada deploy)
- Cards do painel viraram atalhos: cada número abre o detalhe por trás dele
- **Estoque**: cadastro de produto (revenda × uso interno), venda que vira receita,
  reposição que vira despesa, baixa por uso/perda e alerta de reposição
