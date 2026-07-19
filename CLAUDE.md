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
| `index.html` | O app inteiro (uso da Ju) |
| `agendar.html` | **Página pública** de pedido de horário (uso do cliente) |
| `racas.js` | Lista de raças **compartilhada** pelos dois HTMLs |
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

### Consumo automático e previsão de compra

Produto de **uso** ganha `rende` (quantos atendimentos uma unidade cobre) e
`aplicaEm` (`banho`/`tosa`/`todos`). Com isso o estoque fica ligado à agenda:

- `consumirProdutosDoAtendimento()` roda ao **concluir** um atendimento. Ele conta
  atendimentos em `p.usos` e **só baixa 1 unidade quando fecha o rendimento** —
  frasco pela metade confunde, contagem inteira não. Registra a movimentação com
  `motivo:'uso'` e o `atendimentoId`.
- `tipoDoServico()` classifica pelo nome: contém "tosa" → tosa; "banho"/"spa"/"pacote"
  → banho. Se criar serviço com outro nome, revisar essa função.
- `previsaoProduto()` usa o **ritmo real dos últimos 28 dias** (`ritmoAtendimentos`)
  para dizer quantos dias o estoque aguenta e até quando comprar — com **7 dias de
  folga**, porque avisar no dia que acaba não serve para nada.

## Financeiro: editar e ler cupom

- **`editarLanc(id)`** abre o modal preenchido; `salvarLancamento()` decide entre criar
  e atualizar pelo campo escondido `recId`. `openModal('modalReceita')` **sempre volta
  ao modo NOVO** — quem edita entra por `editarLanc`, não por `openModal`.
- **Leitura de cupom fiscal** (`analisarCupom`): aceita a chave de 44 dígitos, o link
  do QR Code ou texto colado. Valida o **dígito verificador (módulo 11)** e extrai
  UF, mês/ano, CNPJ do fornecedor e nº da nota. Guarda `chaveNF` no lançamento, o que
  permite **barrar cupom lançado duas vezes**.
- ⚠️ **O QR Code da NFC-e NÃO traz o valor.** Isso existia na versão 1.0, desativada
  em 2018; a 2.0 removeu `vNF` e `dhEmi`. Pegar o valor exigiria consultar a SEFAZ —
  bloqueado por CORS no navegador e diferente em cada estado. Por isso o app preenche
  tudo menos o valor, e diz isso ao usuário em vez de fingir que leu.
- ⚠️ **A chave só tem ano e mês**, não o dia — o app usa dia 1 e avisa para conferir.
- Scanner nativo (`BarcodeDetector`) aparece só onde existe (Android Chrome). No iOS
  o caminho é colar, igual ao "Pedido do zap".

## Olhinho (ocultar valores)

A Ju abre o app no balcão com o cliente do lado. `alternarValores()` mascara todo o
dinheiro da tela com `R$ ••••`, e o estado fica salvo entre aberturas.

**`brl()` é o ponto único de mascaramento** — todo valor exibido precisa passar por
ela. Se aparecer `'R$ '+x.toLocaleString(...)` solto em algum render novo, aquele
valor vaza com o olhinho fechado. Foi por isso que os 9 pontos que formatavam na mão
foram migrados.

## Conciliação bancária (Bradesco MEI)

**Não existe API viável.** O Bradesco expõe extrato via **Open Finance**, que exige
ser instituição autorizada pelo Banco Central, com certificado ICP e servidor — nada
disso cabe num app sem servidor. Agregadores (Pluggy, Belvo, TecnoSpeed) resolveriam,
mas cobram mensalidade e também exigem backend.

O caminho implementado é **importar o extrato** exportado do Net Empresa:

⚠️ **O Bradesco não exporta OFX.** Ele dá **Excel (.xlsx), CSV e PDF** (confirmado com
os arquivos reais em 19/07/2026). O `lerOFX()` fica no código para outros bancos.

**Ordem de preferência: Excel → CSV → PDF.** O `.xlsx` vem em colunas de verdade
(`Data | Descrição | Documento | Tipo | Valor | Saldo`) com a descrição completa numa
célula só — leitura exata. O PDF exige interpretar layout e pode errar.
Validado: Excel e PDF do mesmo extrato produzem **os 14 lançamentos idênticos** em
data, valor e tipo.

- **`lerXLSX()` + `lerZip()`** — XLSX é um ZIP de XMLs. O navegador não abre ZIP
  sozinho, então `lerZip()` lê o **diretório central** do arquivo (não o cabeçalho
  local: com o bit de "data descriptor" ligado, os tamanhos lá vêm zerados) e infla
  cada item com `DecompressionStream('deflate-raw')` — ZIP usa deflate cru, não zlib.
  Sem biblioteca externa, mantendo o app self-contained.
- ⚠️ No XLSX os textos ficam em `xl/sharedStrings.xml` e as células referenciam por
  índice (`t="s"`). Ler só `<v>` devolve números em vez de texto.
- ⚠️ **`.xlsx` não pode entrar na lista de extensões recusadas** em `importarExtrato`
  — é ZIP por dentro, e a regra que barrava `.zip` barrava a planilha junto.

- **`lerLinhasExtrato()` é o interpretador único** — serve para CSV e para o texto
  extraído do PDF. A ideia: uma linha de extrato é "tem uma data e tem um valor";
  procurar esses dois padrões é mais robusto que depender da posição das colunas,
  que muda entre formatos. Ele também:
  - descarta a **última coluna quando há mais de um valor** (é o saldo, não lançamento);
  - respeita a marca **D/C** do Bradesco quando existe, senão usa o sinal;
  - limpa da descrição a data, os valores, os separadores e os **números soltos**
    (coluna "Docto"), deixando só o histórico legível.
- ⚠️ Separador é `;` ou tab, **nunca `,`**: no Brasil a vírgula é o separador
  decimal, e dividir por ela quebra `65,00` em dois campos (bug real, pego em teste).
  Só entende valor no formato brasileiro (`1.180,00`); formato com ponto decimal
  devolve vazio de propósito, em vez de ler o milhar errado.
- **`extrairTextoPDF()`** infla os streams do PDF com **`DecompressionStream` nativo**
  — sem biblioteca externa, o que preserva o app self-contained e offline. Funciona em
  PDF de **texto** (o extrato é), não em digitalizado.

### As 3 armadilhas do PDF do Bradesco (calibrado no arquivo real, 19/07/2026)

Cada uma sozinha zerava a leitura. Foram descobertas testando contra um extrato de
verdade — nenhuma teria aparecido em teste sintético:

1. **Quebra de linha antes de `endstream`.** Se aquele byte entra junto com o dado
   comprimido, o `DecompressionStream` rejeita o bloco inteiro. `extrairTextoPDF`
   recua sobre `\n`/`\r` antes de inflar. Sintoma: `inflados: 0`.
2. **Fonte com codificação própria.** O texto guardado não é `OPERACAO`, é
   `23(5$&$2`. O PDF traz a correspondência num objeto **`/ToUnicode`**, e
   `montarMapaFonte()` + `parseToUnicode()` leem essa tabela (`beginbfchar` e
   `beginbfrange`). **Sem isso o texto sai ilegível e nada é reconhecido.**
   Sintoma: `letras > 0` mas `0 lançamentos`.
3. **Colunas são fragmentos separados.** Data, descrição e valor não estão no mesmo
   comando de texto. `conteudoParaTexto()` agrupa pela **coordenada Y** (tolerância
   de 2pt) e ordena por X. Quebrar linha a cada operador de posição — que é o óbvio —
   produz 74 fragmentos onde nenhum tem data E valor ao mesmo tempo.

E do lado do `lerLinhasExtrato`, o layout real exigiu:
- **A descrição não está na linha do lançamento.** Um PIX ocupa 3 linhas: o rótulo
  (`PIX ENVIADO`) acima, a linha com data/tipo/valor no meio, e o favorecido
  (`DES: ...`) abaixo. O parser guarda o rótulo pendente e olha a linha seguinte.
- **`Saldo do dia` tem data e valor** e viraria lançamento falso — `RE_IGNORAR` barra.
- Existe coluna **`Tipo`** escrita (Crédito/Débito): é a fonte mais confiável, antes
  da marca D/C e do sinal do número.

⚠️ Mesmo funcionando, **PDF é interpretação de layout**. O app avisa ao ler e pede
conferência. **O CSV continua sendo o caminho exato** — recomendar ele sempre.
- `acharLancamentoParecido()` casa por **mesmo valor + mesmo tipo + até 3 dias** de
  diferença (o banco registra em D+1/D+2).
- Linha sem par vira "+ Lançar" com o modal já preenchido. Conciliado marca
  `l.conciliado=true`, e lançamento conciliado não casa de novo.

## Agendamento pelo cliente (`agendar.html`)

**https://jupet.pages.dev/agendar** — página pública, sem login, para o cliente.

A página **não enxerga a agenda real** e isso é proposital: os dados da Ju vivem no
`localStorage` do celular dela, e o celular do cliente não tem como ler aquilo. Por
isso o fluxo é **pedido → confirmação**, nunca reserva automática. A página diz isso
com todas as letras.

O cliente escolhe serviço, dia e hora, e o botão abre o WhatsApp da Ju com a mensagem
formatada. A Ju copia essa mensagem, toca em **📥 Pedido do zap** na Agenda, cola, e o
agendamento vem preenchido — inclusive casando com o cadastro que já existe.

⚠️ **Os rótulos da mensagem são um contrato entre os dois arquivos.** `montarMensagem()`
no `agendar.html` escreve `Tutor:`, `Pet:`, `Servico:`, `Dia:`, `Hora:`…; `lerPedido()`
no `index.html` lê exatamente esses rótulos. Mudou um lado, mude o outro.

O `lerPedido()` trata três casos: cliente já cadastrado (seleciona direto), tutor
conhecido com pet novo (abre o cadastro do pet) e cliente novo (abre o cadastro
completo). Nos três, volta ao agendamento com tudo preenchido.

### O ciclo pedido → confirmação

O pedido entra como **`status: 'pendente'`**, não como agendamento confirmado. Essa
distinção é o que faz as duas telas conversarem:

```
cliente pede pelo link → WhatsApp → Ju cola em "Pedido do zap"
   → entra como 'pendente'  →  fila "🔔 Pedidos aguardando você" (tela Agenda)
   → Confirmar / Outro horário / Recusar  →  WhatsApp abre com a resposta pronta
```

- **A fila ignora o filtro de data** (`renderPendentes` lê `pedidosPendentes()`
  direto). Um pedido para a semana que vem sumiria se dependesse do dia selecionado —
  e sumir aqui significa cliente sem resposta.
- **`confirmarPedido`** → `agendado` + WhatsApp confirmando (com a regra da retirada
  em 1h). **`abrirModalRemarcar`/`salvarRemarcacao`** → confirma noutro horário e
  explica que o pedido original estava ocupado. **`recusarPedido`** → `cancelado` +
  mensagem pedindo outro dia.
- **O painel avisa primeiro** (`renderAlertaPendentes`, antes de aniversário e
  estoque): tem cliente do outro lado esperando.
- **Pendente não conta como atendimento do dia** nem entra na receita — só o que a
  Ju confirmou (`renderDash` filtra `agendado`/`concluido`).
- Pedido com data já vencida aparece marcado **"data já passou!"**.

**Horário de funcionamento** (`DIAS_ABERTOS` e `HORAS` no `agendar.html`): terça a
sábado, das 9h às 16h, informado pela Ju em 19/07/2026. **O 16h é o último
agendamento, não o fechamento** — o atendimento pode terminar às 17h. Está certo
oferecer 16:00 na grade; não remover. Mudou? Altere lá e faça deploy — não há tela
de configuração ainda.

## Tabela de preços

Fonte: PDF **"Ju Pet — Tabela de Serviços"**, recebido da Ju em 19/07/2026.

**O preço é POR PORTE** (Pequeno / Médio / Grande), em `precos:{}`. As faixas do PDF
original ("R$ 100 a 120") já eram o porte — foram abertas em três valores.

| Serviço | Peq | Méd | Gra | Origem |
|---|---|---|---|---|
| Banho simples | 65 | 75 | 85 | ⚠️ sugerido |
| Banho + finalização | 80 | 90 | 105 | ⚠️ sugerido |
| Banho + hidratação | 100 | 110 | 120 | tabela da Ju |
| Spa Premium | 130 | 140 | 150 | tabela da Ju |
| Tosa higiênica | 75 | 85 | 95 | ⚠️ sugerido |
| Tosa máquina | 90 | 105 | 120 | ⚠️ sugerido |
| Tosa modelada | 120 | 135 | 150 | tabela da Ju |
| Hidratação | 25 | 40 | 60 | tabela da Ju |
| Mechas coloridas | 30 | 45 | 60 | tabela da Ju |

Sem porte (campo `fixo`): Perfume 10 · Desembolo leve/médio/intenso a partir de
20/50/100 · Pacotes Essencial 120, Cuidado 250, Spa Pet 350, Família 220–480,
Manutenção 360–750. `consultar:true` = outros tipos de tosa, sem valor sugerido.

⚠️ **`sugerido:true` marca os 4 valores que EU propus**, não os que a Ju passou. A
tabela dela dava valor único para esses (65/80/75/90) e eu apliquei a mesma proporção
+15%/+30% que as faixas dela mostram. **Aguardando confirmação dela (19/07/2026).**
Enquanto a flag existir, a dica do agendamento mostra "(valor a confirmar)". Ao
confirmar, ajustar o número e remover a flag.

**O porte vem do cadastro do pet** — `porteDoPetSelecionado()` lê o pet escolhido no
agendamento, então o preço sai certo sem ninguém digitar. No Recibo há um seletor de
porte próprio (o recibo não exige cliente cadastrado).

## Raças (`racas.js`)

Arquivo **compartilhado** pelos dois HTMLs — é a única lista que virou arquivo próprio,
porque duplicar ~150 raças garantiria divergência. Carregado com `<script src>` nos dois.

A cadeia é **raça → porte → preço**: escolher "Golden Retriever" preenche porte Grande,
que faz o banho sair R$ 85. Uma escolha em vez de três campos.

- `RACAS_TOPO` (SRD, "não sei") · `RACAS_LISTA` (as raças) · `RACAS_FIM`.
  `RACAS` é montado ordenando só o meio — **não manter ordem à mão**, o código ordena.
- **Campo de busca, não `<select>`:** 150+ raças num select do celular é ruim. A pessoa
  digita e `filtrarRacas()` filtra (sem acento — "maltes" acha "Maltês"; prefixo primeiro).
  Ids por convenção: input = `baseId`, lista = `baseId + 'Lista'`, aviso = `baseId + 'Aviso'`.
  Cada página registra `RACA_AO_ESCOLHER[baseId]` com o que fazer ao escolher.
- **Aceita raça fora da lista** — é só deixar digitado, sem opção "outra". `racaFinal()`
  devolve o texto do campo.
- **SRD e "não sei" têm porte vazio** e não mexem no porte escolhido: um vira-lata pode
  ter qualquer tamanho.
- O porte da raça é **sugestão editável** — Poodle vai de toy a standard, e filhote não
  tem o porte do adulto. `setRaca()` de propósito **não** sobrescreve o porte salvo.

### Como o porte é determinado (e por que isso importa)

O porte define o preço, então virava discussão de balcão ("meu cachorro é pequeno!").
A página do cliente publica o critério **antes** do agendamento, no bloco
"📏 Como definimos o porte".

Duas fontes, nesta ordem:
1. **Raça** → o porte vem de `racas.js`, que reflete altura/peso do adulto no padrão
   da raça.
2. **Sem raça definida / raça digitada livre** → aparece o campo **peso**, e
   `porteDoPeso()` decide: **até 10 kg** Pequeno · **10–25 kg** Médio · **acima de
   25 kg** Grande. ⚠️ Faixas **propostas por mim, a confirmar com a Ju** (19/07/2026).

⚠️ **NÃO escrever que "a CBKC define o porte"** — é falso. A CBKC/FCI classifica as
raças em 10 grupos por **função e morfologia** (pastores, molossos, terriers, spitz…),
não por tamanho: Chow Chow e Lulu da Pomerânia estão no mesmo Grupo 5. O que a CBKC
define, e o que a página cita, é a **altura e o peso do adulto no padrão de cada raça**.
Citar a CBKC como autoridade sobre porte daria ao cliente um argumento contra a Ju.

**Pelagem não é porte** — e essa separação é o que evita a briga. Um Lulu é pequeno
mesmo com muito pelo. A pelagem afeta o **tempo de trabalho**, e entra como
**desembolo** (leve/médio/intenso), que a tabela da Ju já cobra à parte "conforme
avaliação do pet no dia". Nunca embutir pelagem no porte para cobrar mais.

### Raça não atendida (`naoAtende: true`)

**Chow Chow não é atendida**, por segurança do pet e da equipe (decisão da Ju, 19/07/2026).

Ela **continua na lista de propósito**: se sumisse, o cliente digitaria a raça como texto
livre e só descobriria na porta da loja. Aparece na busca com a tarja "não atendemos".

Os dois lados tratam diferente, e isso é intencional:
- **Página do cliente:** mensagem explicando e **botão de envio travado**. Ele não marca.
- **App da Ju:** apenas avisa. **Não bloqueia** — a decisão de abrir exceção é dela.

Para incluir outra raça na regra, basta `naoAtende: true` no `racas.js`; o resto já funciona.

No `index.html`, `SERVICOS_LISTA` é a **fonte única**: o `<select>` do agendamento e
os chips do Recibo são **gerados** dela (`montarSelectServicos`, `montarChipsRecibo`).
Não voltar a digitar opção ou chip no HTML.

⚠️ O `agendar.html` tem a **própria cópia** da tabela (é página separada, para o
cliente). Ao mudar preço, mudar nos **dois** arquivos.

**Regras da loja** (chegada, retirada, taxa de espera, falta sem aviso, pagamento,
extras, dermatite) estão na página do cliente, no passo 4, e o **aceite é obrigatório**
para liberar o envio. A mensagem que chega para a Ju registra "✔ Li e aceito os
combinados". Vieram do mesmo PDF — se a Ju mudar uma regra, mudar lá.

## Segurança e LGPD

**Escape obrigatório (`esc()`).** Todo campo preenchido por gente que vai para
`innerHTML` passa por `esc()`. Não é preciosismo: o dado entra **de fora**, pelo pedido
que o cliente monta no link e a Ju cola no app — um nome com `<img src=x onerror=...>`
executaria script na tela dela. A auditoria de 19/07/2026 achou **15 pontos** assim e
todos foram corrigidos. O `checar-js.js` agora **barra o deploy** se um campo conhecido
voltar a aparecer cru numa linha que monta HTML. Mensagens de WhatsApp são texto puro e
não precisam de escape.

**LGPD (Lei 13.709/2018).** O que joga a favor: a página do cliente **não tem servidor
nem grava nada** — os dados viajam só na mensagem que o próprio cliente envia. Não há
CPF, dado bancário nem dado de saúde humana. A página traz o aviso "🔒 Como cuidamos
dos seus dados" (o que é coletado, para quê, onde fica, e como pedir exclusão pelo
WhatsApp), e o aceite cobre também o uso dos dados. **Ao coletar um campo novo,
atualizar esse aviso** — é o registro da finalidade.

### Cofre (`cofre.js`) — criptografia dos dados

**Opcional, ligado pela Ju** no painel ("🔒 Proteção do aparelho"). Dois modos, e o
resto do app não sabe em qual está:

| | Sem PIN (padrão) | Com PIN (cofre) |
|---|---|---|
| Onde ficam os dados | uma chave `jupet_*` por tipo, em texto puro | **um blob cifrado** em `jupet_cofre` |
| `DB.get`/`DB.set` | lê/escreve o localStorage | lê/escreve `DB._mem` (memória) |
| Gravação | síncrona | assíncrona, com debounce de 150 ms |

**`DB.get`/`DB.set` continuam SÍNCRONOS** — essa foi a decisão de projeto que evitou
reescrever as ~80 chamadas espalhadas pelo app. Com o cofre aberto, tudo vive em
`DB._mem`; `set` atualiza a memória na hora e agenda a cifragem. Use `DB.gravarAgora()`
quando precisar garantir a gravação antes de seguir.

Cripto: **PBKDF2-SHA256, 210k iterações** (salt novo a cada gravação) → **AES-GCM 256**.
PIN errado devolve `null` porque o GCM autentica sozinho — **o PIN não é guardado em
lugar nenhum**. A tela de bloqueio conta as tentativas e impõe espera crescente.

⚠️ **Não existe recuperação.** A chave é o PIN. Por isso `ativarCofre()` **obriga um
backup antes** e só apaga o texto puro **depois** que o blob cifrado gravou. Não
inverter essa ordem.

⚠️ **PIN de 4 dígitos são 10 mil combinações** — protege contra quem pega o celular na
mesa, não contra perícia. `cofreForcaDoPin()` recusa sequências e repetições e
recomenda 6+. Não vender isso como inviolável.

**Risco que sobra:** o arquivo de backup sai **sem criptografia** (de propósito: um
backup que ela não consegue abrir não serve para nada). Orientação: guardar em lugar
privado, nunca em grupo de WhatsApp.

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

## Aviso sobre scripts Python neste repo

NAO usar Python com `io.open(arquivo,'w')` para reescrever o `index.html`.
Em 19/07/2026 isso **zerou o arquivo**: o open truncou antes de falhar ao
reencodar (surrogates no UTF-8 do arquivo). Recuperado com `git checkout`.
Usar as ferramentas de edicao, que fazem escrita atomica.
