// Compressão de foto de pet — arquivo COMPARTILHADO entre o app da Ju
// (index.html) e a página do cliente (agendar.html).
//
// Por que comprimir: a foto crua da câmera tem 3–5 MB e, em base64, ~750 KB só
// para uma. O localStorage inteiro tem ~5 MB, então sem isso o app da Ju para de
// salvar depois de poucos cadastros.
//
// Por que compartilhar: a foto que o cliente manda pelo link precisa sair no
// MESMO padrão da que a Ju tira no balcão. Duas cópias divergiriam.

const FOTO_MAX_PX = 400;     // maior lado da imagem
const FOTO_QUALIDADE = 0.7;  // JPEG

// Recebe um File e devolve um data URL JPEG já reduzido.
function comprimirFoto(file, callback, onErro) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      let w = img.width, h = img.height;
      if (w > h && w > FOTO_MAX_PX) { h = Math.round(h * FOTO_MAX_PX / w); w = FOTO_MAX_PX; }
      else if (h >= w && h > FOTO_MAX_PX) { w = Math.round(w * FOTO_MAX_PX / h); h = FOTO_MAX_PX; }
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(img, 0, 0, w, h);
      callback(cv.toDataURL('image/jpeg', FOTO_QUALIDADE));
    };
    img.onerror = function () {
      if (onErro) onErro();
      else alert('Não consegui ler essa imagem. Tente outra foto.');
    };
    img.src = e.target.result;
  };
  reader.onerror = function () {
    if (onErro) onErro();
  };
  reader.readAsDataURL(file);
}

// data URL -> File, para conseguir anexar a foto no compartilhamento nativo
// (o link wa.me só leva texto; foto só vai pelo share do próprio celular).
function dataUrlParaArquivo(dataUrl, nome) {
  const [cabecalho, base64] = dataUrl.split(',');
  const tipo = (cabecalho.match(/:(.*?);/) || [])[1] || 'image/jpeg';
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new File([bytes], nome || 'pet.jpg', { type: tipo });
}
