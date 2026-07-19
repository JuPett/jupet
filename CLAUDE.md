# CLAUDE.md — Ju Pet

Contexto do projeto para o Claude Code. Leia antes de qualquer alteração.

## ⚠️ Projeto separado

O **Ju Pet não tem nenhuma relação com o CorretoraPro nem com o ConsórcioPro.**
Nunca misturar arquivos, dados, memórias ou contexto entre eles.

Aqui **não existe**: Supabase, banco de dados, migrações, RLS, React, Vite, npm,
seguradoras, operadoras, comissões, NFS-e. Se algo disso aparecer numa sugestão,
é contexto vazado de outro projeto — está errado.

## O que é

App de gestão do **Ju Pet**, banho & tosa em **Acupe de Brotas, Salvador-BA**.
Dona: a Ju ("Tia Ju"). Uso: **uma pessoa, um celular**.

- No ar: **https://jupet.pages.dev** · Manual: `/manual.html`
- Contato no rodapé do app: (71) 98769-9236 · @ju.pett

## Stack (ou a ausência dela)

**Um único arquivo HTML** com CSS e JavaScript embutidos. Sem build, sem
framework, sem servidor, sem login, sem dependência externa (só a fonte do
Google, que degrada bem). `index.html` tem ~1.250 linhas e é o app inteiro.

**Dados: `localStorage` do navegador**, chaves `jupet_clientes`, `jupet_atend`,
`jupet_lanc`, `jupet_ultimo_backup`. Acesso pelo objeto `DB`.

Isso é **escolha deliberada**, não preguiça: uma pessoa só, sem mensalidade,
funciona offline no salão. **Não migrar para Supabase/servidor** sem um motivo
forte e sem conversar antes — seria peso e custo desproporcionais ao negócio.

## A consequência disso (o risco central do projeto)

Os dados existem em **um lugar só**. Trocar de celular, limpar o navegador ou
desinstalar o app no iPhone **apaga tudo**. Por isso:

- **Foto de pet SEMPRE passa por `comprimirFoto()`** (400px, JPEG 0.7). A foto
  crua da câmera tem ~750 KB em base64 e o `localStorage` inteiro tem ~5 MB —
  sem comprimir, o app para de salvar depois de poucos cadastros.
- **`DB.set` avisa quando falha e devolve `true`/`false`.** Nunca voltar ao
  `catch(e){}` vazio: gravação falhando em silêncio faz o app dizer "salvo"
  mentindo, e a Ju só descobre no dia seguinte.
- **O card "🔐 Backup dos dados"** (final da tela Início) é infraestrutura, não
  enfeite. Não remover, não esconder atrás de menu.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | O app inteiro |
| `manual.html` | Manual de uso, escrito para a Ju |
| `manifest.json` · `sw.js` | Instalável + abre offline |
| `icon-192/512.png`, `apple-touch-icon.png` | Ícones (patinha branca no roxo) |
| `deploy.ps1` | Publica no Cloudflare Pages |
| `.env.deploy.ps1` | Credenciais do Cloudflare — **fora do git** |

Telas (`.screen`, trocadas por `goScreen()`): Início · Agenda · Clientes & Pets ·
**Estoque** · Financeiro · Recibo.

## Estoque

Dois tipos de produto, porque se comportam diferente:

- **`revenda`** — coleira, ração, perfume. A saída **vira receita** (`Produto vendido`).
- **`uso`** — shampoo, lâmina. Consumido no serviço; a baixa **não** mexe no financeiro.

A **compra** de qualquer um dos dois vira despesa (`Produtos consumo`). É essa ligação
com o financeiro que faz o estoque ser mantido — lista solta ninguém atualiza.

Dados: `produtos` (`jupet_produtos`) e `movimentacoes` (`jupet_mov`, histórico de
entrada/saída). Alerta de reposição quando `qtd <= minimo`, no painel e na tela.

## Padrão visual

- Roxo `#6B3F8C` (marca) · lilás `#B48DC0` · lilás pálido `#F5EDF9`
- Verde `#2E9E75` (entrada) · vermelho `#E05D5D` (saída) · amarelo `#F5C518` · rosa `#E879A0`
- Fundo `#FAF7FB`, cards brancos `border-radius:16px`, sombra roxa suave
- Títulos em `Cormorant Garamond`, corpo em `DM Sans`
- **Desenhado para celular** (trava em 560px). Emojis como ícones. Tudo em pt-BR.

## Deploy

```powershell
.\deploy.ps1
```

Valida a sintaxe do JavaScript **antes** de publicar. Isso não é zelo excessivo:
num HTML único, um erro de sintaxe deixa a tela **em branco** no celular da Ju
sem nenhuma mensagem de erro. Nunca publicar sem passar por essa checagem.

Ao mexer no app, atualizar `manual.html` junto quando a mudança for visível para
a Ju — o manual é o treinamento dela e faz parte do "done".

## Regras que não podem regredir

- **Agendamento SELECIONA o cliente, não redigita.** `atendimentos` guarda
  `clienteId` e `petId`; `pet`/`tutor`/`tel` são cópia para leitura. Voltar a pedir
  nome digitado ressuscita o bug de dois pets "Mel" com histórico misturado.
  Use `atendimentosDoPet(c,p)` para ler histórico — nunca comparar `a.pet` com `p.nome`.
- **Idade é CALCULADA** a partir de `p.aniv` via `idadeTexto()`. Nunca criar campo de
  idade digitada: envelhece errado.
- **`hojeISO()` / `mesISO()` em vez de `toISOString()`** para datas do dia. O
  `toISOString()` converte para UTC e, em Salvador, depois das 21h devolve o dia seguinte.
- **`getDiasParaAniv` zera `hoje` na meia-noite.** Sem isso, no dia do aniversário
  a data pula para o ano seguinte e aparece "em 365d".
- **`lancarReceitaDoAtend()` é o único caminho para lançar receita de atendimento.**
  Ele guarda `lancamentoId` e avisa se já existe entrada igual no mesmo dia — é o que
  impede a receita de ser contada em dobro junto com o Recibo.
- **`SERVICOS` é a fonte única de preço e retorno.** Os chips do Recibo usam a mesma
  tabela. Mudou preço, muda num lugar só.
- **`esc()` antes de jogar texto do usuário em `innerHTML`.**
- **Criou tipo novo de dado? Inclua no `exportarBackup` E no `importarBackup`.**
  Dado fora do backup é dado que se perde na troca de celular. O `importarBackup`
  precisa tolerar backup antigo sem aquele campo (`dump.x || []`).
- **`DESPESAS_FIXAS` / `TOTAL_FIXO` são a fonte única do custo fixo.** Painel,
  Financeiro, break-even e relatório leem de lá. Não voltar a digitar `5280`.

## Pendências conhecidas

Ainda **não** corrigidas (revisão de 19/07/2026):

1. Não dá para **editar** cliente, pet ou lançamento já salvo — só criar e apagar.
   (Agendamento já pode ser concluído pela agenda; falta editar os demais.)
2. **Preço não varia por porte.** Banho de porte Grande custa mais na prática, mas a
   tabela `SERVICOS` tem um preço só. Depende da Ju passar a tabela real por porte.
3. Despesas fixas (R$ 5.280) **fixas no código**, repetidas em 5 lugares.
4. Apagar cliente deixa os atendimentos dele órfãos no financeiro.
5. Break-even do painel compara receita só com o custo fixo, ignorando as despesas
   variáveis já lançadas — o número sai otimista.

## Histórico

O app nasceu como HTML solto em `C:\Users\freud\OneDrive\Projeto Ju pet\jupe_extracted`
(junto com cardápio, ficha de cadastro, templates de Instagram e o projeto de
expansão 2026). **Foi movido para cá em 19/07/2026** por risco de conflito de
sincronização do OneDrive. A pasta antiga ainda existe e está **desatualizada** —
a fonte da verdade é `C:\Users\freud\jupet`.
