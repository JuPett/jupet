// COFRE — criptografia dos dados do app no celular da Ju.
//
// Problema que resolve: os dados (nome, telefone e histórico de todos os
// clientes) ficavam em texto puro no navegador. Quem pegasse o celular
// desbloqueado lia tudo, e o arquivo de backup saía aberto.
//
// Como funciona: PIN -> PBKDF2(SHA-256) -> chave AES-GCM. Tudo o que era
// `jupet_clientes`, `jupet_atend`... vira UM blob cifrado em `jupet_cofre`.
//
// ⚠️ LIMITE HONESTO: um PIN de 4 dígitos tem 10 mil combinações. Isso protege
// contra quem pega o celular na mesa — NÃO contra perícia com o aparelho em
// mãos e tempo. Por isso o app aceita PIN maior, e recomenda 6+.
//
// ⚠️ SEM RECUPERAÇÃO: a chave é o PIN. Esqueceu, perdeu os dados. É por isso
// que ativar o cofre exige fazer um backup antes (ver `ativarCofre` no app).

const COFRE_CHAVE   = 'jupet_cofre';      // blob cifrado
const COFRE_ITER    = 210000;             // iterações do PBKDF2 (OWASP 2023+)
const COFRE_VERSAO  = 1;

function cofreExiste(){ return !!localStorage.getItem(COFRE_CHAVE); }

function _bytesParaBase64(bytes){
  let s=''; const b=new Uint8Array(bytes);
  for(let i=0;i<b.length;i++) s+=String.fromCharCode(b[i]);
  return btoa(s);
}
function _base64ParaBytes(b64){
  const bin=atob(b64), out=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) out[i]=bin.charCodeAt(i);
  return out;
}

// PIN + salt -> chave AES-GCM
async function _derivarChave(pin, salt){
  const base=await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name:'PBKDF2', salt, iterations:COFRE_ITER, hash:'SHA-256' },
    base,
    { name:'AES-GCM', length:256 },
    false,
    ['encrypt','decrypt']
  );
}

// Cifra um objeto qualquer. Salt e IV novos a cada gravação.
async function cofreCifrar(pin, dados){
  const salt=crypto.getRandomValues(new Uint8Array(16));
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const chave=await _derivarChave(pin, salt);
  const claro=new TextEncoder().encode(JSON.stringify(dados));
  const cifrado=await crypto.subtle.encrypt({name:'AES-GCM', iv}, chave, claro);
  return {
    v: COFRE_VERSAO,
    salt: _bytesParaBase64(salt),
    iv: _bytesParaBase64(iv),
    dados: _bytesParaBase64(cifrado)
  };
}

// Decifra. Devolve null quando o PIN está errado — o AES-GCM detecta sozinho,
// porque a autenticação embutida falha (não é preciso guardar o PIN em lugar nenhum).
async function cofreDecifrar(pin, pacote){
  try{
    const salt=_base64ParaBytes(pacote.salt);
    const iv=_base64ParaBytes(pacote.iv);
    const chave=await _derivarChave(pin, salt);
    const claro=await crypto.subtle.decrypt(
      {name:'AES-GCM', iv}, chave, _base64ParaBytes(pacote.dados));
    return JSON.parse(new TextDecoder().decode(claro));
  }catch(e){
    return null;   // PIN errado ou dado corrompido
  }
}

async function cofreGravar(pin, dados){
  const pacote=await cofreCifrar(pin, dados);
  localStorage.setItem(COFRE_CHAVE, JSON.stringify(pacote));
}
async function cofreLer(pin){
  const bruto=localStorage.getItem(COFRE_CHAVE);
  if(!bruto) return null;
  try{ return await cofreDecifrar(pin, JSON.parse(bruto)); }
  catch(e){ return null; }
}

// Força bruta fica cara: cada tentativa refaz o PBKDF2 (~200 ms).
// Além disso o app conta as tentativas e faz esperar.
function cofreForcaDoPin(pin){
  if(!pin || pin.length<4) return {ok:false, txt:'Use pelo menos 4 dígitos.'};
  if(/^(\d)\1+$/.test(pin))  return {ok:false, txt:'Muito fácil de adivinhar (todos iguais).'};
  if(/^(0123|1234|2345|3456|4567|5678|6789|9876|4321)/.test(pin))
    return {ok:false, txt:'Muito fácil de adivinhar (sequência).'};
  if(pin.length<6) return {ok:true, txt:'Aceitável — 6 dígitos protegem bem mais.', fraco:true};
  return {ok:true, txt:'Bom PIN.'};
}
