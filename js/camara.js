// Cámara y álbum. La foto es la escena tal como se ve: el fondo y el SVG del bebé con sus
// muebles. Como el CSS no viaja con el SVG copiado, a cada elemento se le pegan sus estilos
// ya calculados (colores, qué cara se ve, etc.). Luego se dibujan en un canvas y se guarda
// un JPG chico en el iPad.

const CLAVE = 'casa-de-sarah.fotos';
const MAXIMO = 24;
const LADO_MAXIMO = 900;   // px del lado más largo de la foto
const PROPIEDADES = [
  'fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-linecap',
  'stroke-linejoin', 'stroke-dasharray', 'opacity', 'display', 'visibility', 'paint-order',
  'font-family', 'font-size', 'font-weight',
];

// ---------- Guardar ----------

export function cargarFotos() {
  try {
    const fotos = JSON.parse(localStorage.getItem(CLAVE) || '[]');
    return Array.isArray(fotos) ? fotos.filter((f) => typeof f === 'string' && f.startsWith('data:image/')) : [];
  } catch {
    return [];
  }
}

/** Guarda las últimas fotos; si no cabe, va quitando las más viejas. Regresa lo que quedó. */
export function guardarFotos(fotos) {
  let lista = fotos.slice(-MAXIMO);
  while (lista.length) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(lista));
      return lista;
    } catch {
      lista = lista.slice(1);
    }
  }
  return lista;
}

// ---------- Tomar la foto ----------

/** Copia un SVG con los estilos calculados pegados en cada elemento. */
function copiarConEstilos(svg) {
  const copia = svg.cloneNode(true);
  const originales = [svg, ...svg.querySelectorAll('*')];
  const copias = [copia, ...copia.querySelectorAll('*')];
  originales.forEach((el, i) => {
    const cs = getComputedStyle(el);
    let estilo = '';
    for (const p of PROPIEDADES) {
      const v = cs.getPropertyValue(p);
      // Safari a veces da url("http://.../index.html#patron"): se deja solo #patron.
      if (v) estilo += `${p}:${v.replace(/url\("?[^#")]*(#[^")]+)"?\)/g, 'url($1)')};`;
    }
    // Transformaciones que pone el juego (la cuna meciéndose); las animaciones de CSS no se copian.
    if (el.style?.transform) {
      estilo += `transform:${el.style.transform};transform-box:${cs.transformBox};transform-origin:${cs.transformOrigin};`;
    }
    copias[i].setAttribute('style', estilo);
  });
  return copia;
}

function aImagen(svg, ancho, alto) {
  const copia = copiarConEstilos(svg);
  copia.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  copia.setAttribute('width', ancho);
  copia.setAttribute('height', alto);
  const texto = new XMLSerializer().serializeToString(copia);
  return new Promise((listo, falla) => {
    const img = new Image();
    img.onload = () => listo(img);
    img.onerror = falla;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(texto)}`;
  });
}

/** Área donde de verdad se dibuja un elemento (sin su relleno de CSS). */
function contenido(el) {
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  const pl = parseFloat(cs.paddingLeft) || 0;
  const pt = parseFloat(cs.paddingTop) || 0;
  return {
    x: r.left + pl,
    y: r.top + pt,
    w: r.width - pl - (parseFloat(cs.paddingRight) || 0),
    h: r.height - pt - (parseFloat(cs.paddingBottom) || 0),
  };
}

/** Toma la foto de la escena. Regresa un JPG como data URL. */
export async function tomarFoto({ fondo, escena, noche }) {
  const zona = contenido(escena);
  const rf = fondo.getBoundingClientRect();
  const k = Math.min(1.5, LADO_MAXIMO / Math.max(zona.w, zona.h));
  const [imgFondo, imgEscena] = await Promise.all([
    aImagen(fondo, rf.width, rf.height),
    aImagen(escena, zona.w, zona.h),
  ]);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(zona.w * k);
  canvas.height = Math.round(zona.h * k);
  const g = canvas.getContext('2d');
  g.drawImage(imgFondo, (rf.left - zona.x) * k, (rf.top - zona.y) * k, rf.width * k, rf.height * k);
  g.drawImage(imgEscena, 0, 0, canvas.width, canvas.height);
  if (noche) {
    g.fillStyle = 'rgba(26, 22, 80, 0.62)';
    g.fillRect(0, 0, canvas.width, canvas.height);
  }
  return canvas.toDataURL('image/jpeg', 0.8);
}
