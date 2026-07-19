// Raças de cachorro — arquivo COMPARTILHADO entre o app da Ju (index.html) e a
// página do cliente (agendar.html). É a única lista duplicada que virou arquivo
// próprio: são ~180 linhas, e manter duas cópias garantiria divergência.
//
// Cada raça traz o PORTE típico do adulto, que serve para dois usos:
//   1. preencher o porte sozinho ao escolher a raça (menos digitação);
//   2. o preço sair certo, já que a tabela é por porte.
//
// ⚠️ O porte aqui é SUGESTÃO — sempre editável. Um Poodle pode ser toy ou standard,
// um SRD pode ter qualquer tamanho, e filhote não tem o porte do adulto.
// Critério: Pequeno até ~10kg · Médio 10–25kg · Grande acima de 25kg.

// sem raça definida vem primeiro: é o caso mais comum no balcão
const RACAS_TOPO = [
  { n: 'SRD — Sem raça definida (vira-lata)', p: '' },
  { n: 'Não sei a raça',                      p: '' }
];
// escape para o que não estiver na lista
const RACAS_FIM = [
  { n: 'Outra raça (digitar)', p: '' }
];

const RACAS_LISTA = [
  { n: 'Affenpinscher',                    p: 'Pequeno' },
  { n: 'Airedale Terrier',                 p: 'Grande'  },
  { n: 'Akita Americano',                  p: 'Grande'  },
  { n: 'Akita Inu',                        p: 'Grande'  },
  { n: 'American Bully',                   p: 'Médio'   },
  { n: 'American Staffordshire Terrier',   p: 'Grande'  },
  { n: 'Basenji',                          p: 'Médio'   },
  { n: 'Basset Hound',                     p: 'Médio'   },
  { n: 'Beagle',                           p: 'Médio'   },
  { n: 'Bearded Collie',                   p: 'Grande'  },
  { n: 'Beauceron',                        p: 'Grande'  },
  { n: 'Bedlington Terrier',               p: 'Pequeno' },
  { n: 'Bichon Frisé',                     p: 'Pequeno' },
  { n: 'Bloodhound',                       p: 'Grande'  },
  { n: 'Bobtail (Old English Sheepdog)',   p: 'Grande'  },
  { n: 'Boerboel',                         p: 'Grande'  },
  { n: 'Boiadeiro Australiano',            p: 'Médio'   },
  { n: 'Boiadeiro Bernês',                 p: 'Grande'  },
  { n: 'Border Collie',                    p: 'Médio'   },
  { n: 'Border Terrier',                   p: 'Pequeno' },
  { n: 'Borzoi',                           p: 'Grande'  },
  { n: 'Boston Terrier',                   p: 'Pequeno' },
  { n: 'Bouvier de Flandres',              p: 'Grande'  },
  { n: 'Boxer',                            p: 'Grande'  },
  { n: 'Braco Alemão',                     p: 'Grande'  },
  { n: 'Briard',                           p: 'Grande'  },
  { n: 'Buldogue Americano',               p: 'Grande'  },
  { n: 'Buldogue Campeiro',                p: 'Grande'  },
  { n: 'Buldogue Francês',                 p: 'Médio'   },
  { n: 'Buldogue Inglês',                  p: 'Médio'   },
  { n: 'Bull Terrier',                     p: 'Médio'   },
  { n: 'Bull Terrier Miniatura',           p: 'Pequeno' },
  { n: 'Bullmastiff',                      p: 'Grande'  },
  { n: 'Cairn Terrier',                    p: 'Pequeno' },
  { n: 'Cane Corso',                       p: 'Grande'  },
  { n: 'Cão de Água Português',            p: 'Médio'   },
  { n: 'Cão de Crista Chinês',             p: 'Pequeno' },
  { n: 'Cavalier King Charles Spaniel',    p: 'Pequeno' },
  { n: 'Chihuahua',                        p: 'Pequeno' },
  // NÃO ATENDIDA por segurança (do pet e de quem trabalha) — decisão da Ju,
  // 19/07/2026. Fica na lista de propósito: se sumisse, o cliente escolheria
  // "outra raça" e só descobriria na porta da loja.
  { n: 'Chow Chow',                        p: 'Grande', naoAtende: true },
  { n: 'Cocker Spaniel Americano',         p: 'Médio'   },
  { n: 'Cocker Spaniel Inglês',            p: 'Médio'   },
  { n: 'Collie',                           p: 'Grande'  },
  { n: 'Corgi (Cardigan)',                 p: 'Médio'   },
  { n: 'Corgi (Pembroke)',                 p: 'Médio'   },
  { n: 'Coton de Tuléar',                  p: 'Pequeno' },
  { n: 'Dachshund (Teckel / Salsicha)',    p: 'Pequeno' },
  { n: 'Dálmata',                          p: 'Grande'  },
  { n: 'Doberman',                         p: 'Grande'  },
  { n: 'Dogo Argentino',                   p: 'Grande'  },
  { n: 'Dogue Alemão',                     p: 'Grande'  },
  { n: 'Dogue de Bordeaux',                p: 'Grande'  },
  { n: 'Elkhound Norueguês',               p: 'Médio'   },
  { n: 'Eurasier',                         p: 'Médio'   },
  { n: 'Fila Brasileiro',                  p: 'Grande'  },
  { n: 'Flat-Coated Retriever',            p: 'Grande'  },
  { n: 'Fox Paulistinha (Terrier Brasileiro)', p: 'Pequeno' },
  { n: 'Fox Terrier (Pelo Duro)',          p: 'Pequeno' },
  { n: 'Fox Terrier (Pelo Liso)',          p: 'Pequeno' },
  { n: 'Galgo Inglês (Greyhound)',         p: 'Grande'  },
  { n: 'Galgo Italiano',                   p: 'Pequeno' },
  { n: 'Golden Retriever',                 p: 'Grande'  },
  { n: 'Goldendoodle',                     p: 'Grande'  },
  { n: 'Grande Boiadeiro Suíço',           p: 'Grande'  },
  { n: 'Griffon de Bruxelas',              p: 'Pequeno' },
  { n: 'Havanês',                          p: 'Pequeno' },
  { n: 'Husky Siberiano',                  p: 'Grande'  },
  { n: 'Jack Russell Terrier',             p: 'Pequeno' },
  { n: 'Keeshond',                         p: 'Médio'   },
  { n: 'Kelpie Australiano',               p: 'Médio'   },
  { n: 'Kerry Blue Terrier',               p: 'Médio'   },
  { n: 'Komondor',                         p: 'Grande'  },
  { n: 'Kuvasz',                           p: 'Grande'  },
  { n: 'Labradoodle',                      p: 'Grande'  },
  { n: 'Labrador Retriever',               p: 'Grande'  },
  { n: 'Lagotto Romagnolo',                p: 'Médio'   },
  { n: 'Lakeland Terrier',                 p: 'Pequeno' },
  { n: 'Leonberger',                       p: 'Grande'  },
  { n: 'Lhasa Apso',                       p: 'Pequeno' },
  { n: 'Löwchen',                          p: 'Pequeno' },
  { n: 'Lulu da Pomerânia (Spitz Alemão)', p: 'Pequeno' },
  { n: 'Malamute do Alasca',               p: 'Grande'  },
  { n: 'Maltês',                           p: 'Pequeno' },
  { n: 'Maltipoo',                         p: 'Pequeno' },
  { n: 'Manchester Terrier',               p: 'Pequeno' },
  { n: 'Mastiff Inglês',                   p: 'Grande'  },
  { n: 'Mastim Napolitano',                p: 'Grande'  },
  { n: 'Mastim Tibetano',                  p: 'Grande'  },
  { n: 'Norfolk Terrier',                  p: 'Pequeno' },
  { n: 'Norwich Terrier',                  p: 'Pequeno' },
  { n: 'Papillon',                         p: 'Pequeno' },
  { n: 'Pastor Alemão',                    p: 'Grande'  },
  { n: 'Pastor Australiano',               p: 'Grande'  },
  { n: 'Pastor Belga Malinois',            p: 'Grande'  },
  { n: 'Pastor Branco Suíço',              p: 'Grande'  },
  { n: 'Pastor de Shetland',               p: 'Médio'   },
  { n: 'Pastor do Cáucaso',                p: 'Grande'  },
  { n: 'Pastor Maremano',                  p: 'Grande'  },
  { n: 'Pastor dos Pirineus',              p: 'Grande'  },
  { n: 'Pequinês',                         p: 'Pequeno' },
  { n: 'Petit Basset Griffon Vendéen',     p: 'Médio'   },
  { n: 'Pinscher Miniatura',               p: 'Pequeno' },
  { n: 'Pit Bull (American Pit Bull Terrier)', p: 'Médio' },
  { n: 'Podengo Português',                p: 'Médio'   },
  { n: 'Pointer Inglês',                   p: 'Grande'  },
  { n: 'Pomsky',                           p: 'Médio'   },
  { n: 'Poodle Anão (Miniatura)',          p: 'Pequeno' },
  { n: 'Poodle Médio',                     p: 'Médio'   },
  { n: 'Poodle Standard (Gigante)',        p: 'Grande'  },
  { n: 'Poodle Toy',                       p: 'Pequeno' },
  { n: 'Presa Canário',                    p: 'Grande'  },
  { n: 'Pug',                              p: 'Pequeno' },
  { n: 'Puli',                             p: 'Médio'   },
  { n: 'Rat Terrier',                      p: 'Pequeno' },
  { n: 'Rhodesian Ridgeback',              p: 'Grande'  },
  { n: 'Rottweiler',                       p: 'Grande'  },
  { n: 'Saluki',                           p: 'Grande'  },
  { n: 'Samoieda',                         p: 'Grande'  },
  { n: 'São Bernardo',                     p: 'Grande'  },
  { n: 'Schipperke',                       p: 'Pequeno' },
  { n: 'Schnauzer Gigante',                p: 'Grande'  },
  { n: 'Schnauzer Miniatura',              p: 'Pequeno' },
  { n: 'Schnauzer Standard',               p: 'Médio'   },
  { n: 'Schnoodle',                        p: 'Pequeno' },
  { n: 'Scottish Terrier',                 p: 'Pequeno' },
  { n: 'Sealyham Terrier',                 p: 'Pequeno' },
  { n: 'Setter Gordon',                    p: 'Grande'  },
  { n: 'Setter Irlandês',                  p: 'Grande'  },
  { n: 'Shar Pei',                         p: 'Médio'   },
  { n: 'Shiba Inu',                        p: 'Médio'   },
  { n: 'Shih Tzu',                         p: 'Pequeno' },
  { n: 'Silky Terrier',                    p: 'Pequeno' },
  { n: 'Skye Terrier',                     p: 'Pequeno' },
  { n: 'Soft Coated Wheaten Terrier',      p: 'Médio'   },
  { n: 'Spaniel Bretão',                   p: 'Médio'   },
  { n: 'Spinone Italiano',                 p: 'Grande'  },
  { n: 'Spitz Japonês',                    p: 'Pequeno' },
  { n: 'Springer Spaniel Inglês',          p: 'Médio'   },
  { n: 'Staffordshire Bull Terrier',       p: 'Médio'   },
  { n: 'Sussex Spaniel',                   p: 'Médio'   },
  { n: 'Terra Nova',                       p: 'Grande'  },
  { n: 'Terrier Tibetano',                 p: 'Médio'   },
  { n: 'Tosa Inu',                         p: 'Grande'  },
  { n: 'Vizsla',                           p: 'Grande'  },
  { n: 'Volpino Italiano',                 p: 'Pequeno' },
  { n: 'Weimaraner',                       p: 'Grande'  },
  { n: 'Welsh Terrier',                    p: 'Pequeno' },
  { n: 'West Highland White Terrier (Westie)', p: 'Pequeno' },
  { n: 'Whippet',                          p: 'Médio'   },
  { n: 'Yorkshire Terrier',                p: 'Pequeno' }
];

// Ordena por código, não à mão: a lista é grande e manter a ordem manualmente
// falha na primeira inclusão apressada. localeCompare pt-BR trata os acentos.
const RACAS = [
  ...RACAS_TOPO,
  ...RACAS_LISTA.slice().sort((a, b) => a.n.localeCompare(b.n, 'pt-BR')),
  ...RACAS_FIM
];

// ─── CONSULTAS ───
function racaPorNome(nome) {
  const t = normalizarTexto(nome);
  return RACAS.find(x => normalizarTexto(x.n) === t) || null;
}
// porte típico de uma raça ('' quando não dá para saber, como SRD)
function porteDaRaca(nome) {
  const r = racaPorNome(nome);
  return r ? r.p : '';
}
// raça que a loja não atende? (devolve o objeto ou null)
function racaBloqueada(nome) {
  const r = racaPorNome(nome);
  return r && r.naoAtende ? r : null;
}
// minúsculas e sem acento: "maltes" acha "Maltês", "poodle toy" acha "Poodle Toy".
// O intervalo ̀-ͯ é escrito com escape de propósito: são os sinais de
// acentuação separados pelo NFD, e escrevê-los literalmente quebra se o arquivo
// for reencodado por alguma ferramenta.
function normalizarTexto(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}
function filtrarRacas(q, limite) {
  const t = normalizarTexto(q);
  if (!t) return RACAS.slice(0, limite || 8);
  // começa com o termo primeiro, depois contém — quem digita "pas" quer "Pastor"
  const comeca = [], contem = [];
  for (const r of RACAS) {
    const n = normalizarTexto(r.n);
    if (n.startsWith(t)) comeca.push(r);
    else if (n.includes(t)) contem.push(r);
  }
  return comeca.concat(contem).slice(0, limite || 8);
}

// ─── CAMPO DE BUSCA DE RAÇA ───
// A lista tem 150+ raças: rolar um <select> no celular é ruim. Aqui a pessoa
// digita e a lista filtra. Também aceita raça fora da lista — é só digitar e
// seguir, sem precisar escolher uma opção "outra".
//
// Convenção de ids: input = baseId, lista = baseId + 'Lista'.
// Cada página registra em RACA_AO_ESCOLHER o que fazer ao escolher (setar porte,
// recalcular preço, bloquear raça não atendida).
const RACA_AO_ESCOLHER = {};

function racaBuscar(baseId) {
  const input = document.getElementById(baseId);
  const lista = document.getElementById(baseId + 'Lista');
  if (!input || !lista) return;
  const achados = filtrarRacas(input.value, 8);
  if (!achados.length) {
    lista.innerHTML = '<div class="raca-vazio">Não achei essa raça na lista — pode deixar digitado assim mesmo. 🐾</div>';
    lista.style.display = 'block';
  } else {
    lista.innerHTML = achados.map(r => {
      const aviso = r.naoAtende ? ' <span class="raca-bloq">não atendemos</span>' : '';
      const porte = r.p ? `<span class="raca-porte">${r.p}</span>` : '';
      return `<div class="raca-item" onclick="racaEscolher('${baseId}', ${JSON.stringify(r.n).replace(/"/g, '&quot;')})">
        <span>${r.n}${aviso}</span>${porte}</div>`;
    }).join('');
    lista.style.display = 'block';
  }
  if (RACA_AO_ESCOLHER[baseId]) RACA_AO_ESCOLHER[baseId](input.value, porteDaRaca(input.value));
}

function racaEscolher(baseId, nome) {
  const input = document.getElementById(baseId);
  input.value = nome;
  racaFechar(baseId);
  if (RACA_AO_ESCOLHER[baseId]) RACA_AO_ESCOLHER[baseId](nome, porteDaRaca(nome));
}

function racaFechar(baseId) {
  const lista = document.getElementById(baseId + 'Lista');
  if (lista) lista.style.display = 'none';
}

// preenche o campo sem disparar efeito colateral (usado ao reabrir cadastro)
function setRacaValor(baseId, valor) {
  const input = document.getElementById(baseId);
  if (input) input.value = valor || '';
  racaFechar(baseId);
}
