// Bañar: el bebé llega con lodo. El jabón hace espuma y quita el lodo, la regadera
// quita la espuma y la toalla lo seca. El patito suena y las pompas se revientan.

const NS = 'http://www.w3.org/2000/svg';
// Manchas de lodo (coordenadas del bebé), todas arriba del agua para que se alcancen.
const LODO = [[-52, -356], [66, -262], [-108, -152], [40, -150], [-36, -128], [110, -150]];
const COLOR_LODO = '#9a6a43';
const PATITO = [470, 452];
const SECADO = 16;

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const entre = (a, b) => a + Math.random() * (b - a);

let e = null;

/** ¿Está el punto (del bebé) sobre la parte que queda fuera del agua? */
const fueraDelAgua = (l, ctx) => l[1] < -96 && ctx.bebe.contiene(l);

function sonar(nombre, ms, ctx) {
  const ahora = performance.now();
  if (ahora - (e.ultimo[nombre] || 0) < ms) return;
  e.ultimo[nombre] = ahora;
  ctx.sonido[nombre]();
}

// ---------- Jabón ----------

function enjabonar(p, ctx) {
  const l = ctx.aBebe(p);
  if (e.terminado || !fueraDelAgua(l, ctx)) return;
  if (!e.ultimaEspuma || dist(l, e.ultimaEspuma) > 14) {
    e.ultimaEspuma = l;
    if (ctx.bebe.cuantaEspuma() < 90) ctx.bebe.agregarEspuma(l[0] + entre(-6, 6), l[1] + entre(-6, 6));
    sonar('tallar', 90, ctx);
    if (Math.random() < 0.15) soltarPompa(p, ctx);
  }
  let cambio = false;
  for (const m of e.lodo) {
    if (dist([m.x, m.y], l) < 48) {
      m.vida -= 0.18;
      cambio = true;
    }
  }
  if (cambio) {
    e.lodo = e.lodo.filter((m) => m.vida > 0);
    ctx.bebe.manchas(e.lodo);
    if (!e.lodo.length) ctx.repasar();
  }
}

// ---------- Regadera ----------

function chorro(ctx, p) {
  const efectos = ctx.grupo('efectos');
  let g = efectos.querySelector('.chorro');
  if (!p) { g?.remove(); return; }
  if (!g) {
    g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'chorro');
    g.innerHTML = [-26, -9, 9, 26].map((x) =>
      `<path class="gota" d="M ${x} 18 L ${x * 1.3} 130"/>`).join('');
    efectos.append(g);
  }
  g.setAttribute('transform', `translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})`);
}

function enjuagar(p, ctx) {
  ctx.sonido.agua(true);
  chorro(ctx, p);
  if (e.terminado) return;
  const l = ctx.aBebe([p[0], p[1] + 60]);   // el agua cae debajo de la regadera
  if (ctx.bebe.quitarEspumaCerca(l[0], l[1], 80)) {
    sonar('pop', 70, ctx);
    revisar(ctx);
  }
}

// ---------- Toalla ----------

function secar(p, ctx) {
  if (!e.limpio || e.terminado) return;
  const l = ctx.aBebe(p);
  if (!ctx.bebe.contiene(l)) return;
  if (e.ultimoSecado && dist(l, e.ultimoSecado) < 22) return;
  e.ultimoSecado = l;
  e.secado++;
  sonar('frotar', 120, ctx);
  if (e.secado >= SECADO) {
    e.terminado = true;
    ctx.bebe.modo('toalla');
    ctx.quitarRopa();   // la ropa se fue a lavar: queda en pañal hasta que lo vistan
    ctx.terminar();
  }
}

// ---------- Pompas de jabón que suben ----------

function soltarPompa(p, ctx) {
  const r = entre(10, 18);
  const c = document.createElementNS(NS, 'circle');
  c.setAttribute('class', 'pompa');
  c.setAttribute('cx', p[0].toFixed(1));
  c.setAttribute('cy', p[1].toFixed(1));
  c.setAttribute('r', r.toFixed(1));
  ctx.grupo('efectos').append(c);
  const dx = entre(-60, 60);
  const animacion = c.animate([
    { transform: 'translate(0, 0)', opacity: 0.95 },
    { transform: `translate(${dx * 0.6}px, -120px)`, opacity: 0.95, offset: 0.6 },
    { transform: `translate(${dx}px, -220px)`, opacity: 0 },
  ], { duration: entre(3000, 4200), easing: 'ease-out' });
  animacion.onfinish = () => c.remove();
}

function reventarPompa(cliente, ctx) {
  for (const c of ctx.grupo('efectos').querySelectorAll('.pompa')) {
    const r = c.getBoundingClientRect();
    const radio = r.width / 2 + 18;
    if (Math.hypot(cliente.x - (r.left + r.width / 2), cliente.y - (r.top + r.height / 2)) < radio) {
      c.remove();
      ctx.sonido.pop();
      return true;
    }
  }
  return false;
}

// ---------- ¿Ya quedó limpio? ----------

function revisar(ctx) {
  if (e.limpio || e.lodo.length || ctx.bebe.cuantaEspuma()) return;
  e.limpio = true;
  ctx.bebe.expresion('felices', 'risa', 1200);
  ctx.sonido.risa();
  ctx.chispas(ctx.deBebe([0, -260]));
  ctx.repasar();
}

export default {
  id: 'banar',
  herramientas: ['jabon', 'regadera', 'toalla'],

  entrar(ctx) {
    e = {
      lodo: LODO.map(([x, y]) => ({ x, y, color: COLOR_LODO, vida: 1, tam: 15 })),
      ultimaEspuma: null, ultimoSecado: null, limpio: false, secado: 0, terminado: false, ultimo: {},
    };
    ctx.bebe.manchas(e.lodo);
    ctx.bebe.limpiarEspuma();
    ctx.bebe.base('abiertos', 'sonrisa');
  },

  salir(ctx) {
    ctx.sonido.agua(false);
    chorro(ctx, null);
    ctx.bebe.limpiarEspuma();
    e = null;
  },

  alMover(id, p, ctx) {
    if (id === 'jabon') enjabonar(p, ctx);
    else if (id === 'regadera') enjuagar(p, ctx);
    else if (id === 'toalla') secar(p, ctx);
  },

  alSoltar(id, p, ctx) {
    if (id === 'regadera') {
      ctx.sonido.agua(false);
      chorro(ctx, null);
    }
  },

  alTocar(p, ctx, cliente) {
    if (dist(p, PATITO) < 55) {
      ctx.sonido.patito();
      const patito = ctx.grupo('patito');
      patito.classList.remove('cuac');
      patito.getBoundingClientRect();
      patito.classList.add('cuac');
      return;
    }
    if (reventarPompa(cliente, ctx)) return;
    if (ctx.bebe.contiene(ctx.aBebe(p))) ctx.cosquillas();
  },

  pista(ctx) {
    if (!e || e.terminado) return null;
    if (e.lodo.length) {
      const m = e.lodo[0];
      return { herramienta: 'jabon', hasta: [ctx.deBebe([m.x, m.y])], frotar: true };
    }
    const espuma = ctx.bebe.primeraEspuma();
    if (espuma) return { herramienta: 'regadera', hasta: [ctx.deBebe([espuma[0], espuma[1] - 60])], frotar: true };
    return { herramienta: 'toalla', hasta: [ctx.deBebe([0, -200])], frotar: true };
  },
};
