// Pompas de jabón que suben flotando y se revientan con el dedo.
// Las usan el baño (al enjabonar) y el burbujero (al jugar).

const NS = 'http://www.w3.org/2000/svg';
const entre = (a, b) => a + Math.random() * (b - a);

/** Suelta una pompa en `capa` (un <g> de la escena) en el punto [x, y]. */
export function soltarPompa(capa, [x, y], { subir = 220, radio = [10, 18], duracion = [3000, 4200] } = {}) {
  const r = entre(...radio);
  const c = document.createElementNS(NS, 'circle');
  c.setAttribute('class', 'pompa');
  c.setAttribute('cx', x.toFixed(1));
  c.setAttribute('cy', y.toFixed(1));
  c.setAttribute('r', r.toFixed(1));
  capa.append(c);
  const dx = entre(-70, 70);
  const animacion = c.animate([
    { transform: 'translate(0, 0) scale(0.4)', opacity: 0.95 },
    { transform: `translate(${dx * 0.6}px, ${-subir * 0.55}px) scale(1)`, opacity: 0.95, offset: 0.6 },
    { transform: `translate(${dx}px, ${-subir}px) scale(1.05)`, opacity: 0 },
  ], { duration: entre(...duracion), easing: 'ease-out' });
  animacion.onfinish = () => c.remove();
}

/** La pompa que esté bajo el dedo (`cliente` en coordenadas de pantalla), o null. */
export function pompaEn(capa, cliente) {
  for (const c of capa.querySelectorAll('.pompa')) {
    const r = c.getBoundingClientRect();
    if (Math.hypot(cliente.x - (r.left + r.width / 2), cliente.y - (r.top + r.height / 2)) < r.width / 2 + 20) return c;
  }
  return null;
}

/** Revienta la pompa que esté bajo el dedo. Regresa true si había una. */
export function reventarPompa(capa, cliente) {
  const c = pompaEn(capa, cliente);
  c?.remove();
  return !!c;
}
