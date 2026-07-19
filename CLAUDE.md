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
Financeiro · Recibo.

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

## Pendências conhecidas

Levantadas na revisão de 19/07/2026, ainda **não** corrigidas:

1. Não dá para **editar** cliente, pet, agendamento ou lançamento — só criar e apagar.
2. Agendamento não pode ser marcado como concluído depois (consequência do item 1),
   o que na prática esvazia a agenda: ela tem que cadastrar já como "concluído".
3. `getDiasParaAniv` compara com a **hora atual**, então no dia do aniversário
   joga para o ano seguinte e o perfil mostra "em 365d". Só o banner do dashboard
   escapa, porque trata esse caso à parte.
4. Atendimento liga no pet **por nome em texto livre** — dois pets "Mel" misturam histórico.
5. Receita pode ser contada **em dobro** (atendimento concluído + recibo do mesmo serviço).
6. Depois das 21h o app trata "hoje" como o dia seguinte (`toISOString()` converte para UTC).
7. Despesas fixas (R$ 5.280) **fixas no código**, repetidas em 5 lugares.
8. Apagar cliente deixa os atendimentos dele órfãos no financeiro.

## Histórico

O app nasceu como HTML solto em `C:\Users\freud\OneDrive\Projeto Ju pet\jupe_extracted`
(junto com cardápio, ficha de cadastro, templates de Instagram e o projeto de
expansão 2026). **Foi movido para cá em 19/07/2026** por risco de conflito de
sincronização do OneDrive. A pasta antiga ainda existe e está **desatualizada** —
a fonte da verdade é `C:\Users\freud\jupet`.
