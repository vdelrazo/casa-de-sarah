// Comer: papilla con cuchara (4 cucharadas), luego el biberón y al final palmaditas
// hasta que eructa. Si se embarra la cara, la servilleta la limpia.

import { dibujarPlato } from './escenas.js';
import { HERRAMIENTAS } from './iconos.js';
import { BOCA } from './bebe.js';

const SABORES = ['#ffd54f', '#ffa94d', '#9be07a', '#e599f7'];
const PLATO = [440, 440];
const CUCHARADAS = 4;
// Lugares de la cara (coordenadas del bebé) donde puede quedar papilla embarrada.
const EMBARRADOS = [[62, -230], [-60, -234], [4, -204], [-34, -350], [50, -340], [88, -282]];

const azar = (lista) => lista[Math.floor(Math.random() * lista.length)];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

let e = null;   // estado de esta visita a la silla alta

const boca = (ctx) => ctx.deBebe(BOCA);

function plato(ctx) {
  const nivel = CUCHARADAS - e.cucharadas - (e.llena ? 1 : 0);
  ctx.grupo('plato').innerHTML = dibujarPlato(Math.max(0, nivel), e.color);
}

function caraDeSiempre(ctx) {
  if (e.eructo === 'pendiente') ctx.bebe.base('abiertos', 'puchero');
  else ctx.bebe.base('abiertos', 'sonrisa');
}

// ---------- Cuchara ----------

function moverCuchara(p, ctx) {
  if (!e.llena && e.cucharadas < CUCHARADAS && dist(p, PLATO) < 62) {
    e.llena = true;
    ctx.sonido.plop();
    ctx.refrescarHerramienta('cuchara');
    plato(ctx);
    ctx.repasar();
  }
  if (!e.llena) return;
  const d = dist(p, boca(ctx));
  if (d < 50) darCucharada(ctx);
  else ctx.bebe.base('abiertos', d < 170 ? 'abierta' : 'sonrisa');   // abre la boca cuando ve venir la cuchara
}

function darCucharada(ctx) {
  e.llena = false;
  e.cucharadas++;
  ctx.refrescarHerramienta('cuchara');
  ctx.bebe.base('abiertos', 'sonrisa');
  ctx.bebe.expresion('felices', 'mastica', 800);
  ctx.sonido.nam();
  // Se embarra en las cucharadas pares, y a veces también en las otras: limpiarlo es parte del juego.
  if (e.cucharadas % 2 === 0 || Math.random() < 0.35) {
    const libres = EMBARRADOS.filter(([x, y]) => !e.manchas.some((m) => m.x === x && m.y === y));
    if (libres.length) {
      const [x, y] = azar(libres);
      e.manchas.push({ x, y, color: e.color, vida: 1, tam: 14 });
      ctx.bebe.manchas(e.manchas);
    }
  }
  if (e.cucharadas === CUCHARADAS) setTimeout(() => e && ctx.bebe.animar('salto'), 500);
  revisar(ctx);
  ctx.repasar();
}

// ---------- Biberón ----------

function moverBiberon(p, ctx) {
  if (e.leche <= 0) return;
  const cerca = dist(p, boca(ctx)) < 54;
  if (cerca && !e.chupando) {
    ctx.bebe.base('abiertos', 'chupa');
    let tragos = 0;
    e.chupando = setInterval(() => {
      e.leche = Math.max(0, e.leche - 0.04);
      ctx.refrescarHerramienta('biberon');
      if (++tragos % 4 === 1) ctx.sonido.trago();
      if (e.leche <= 0) {
        pararDeChupar(ctx);
        ctx.bebe.expresion('felices', 'sonrisa', 700);
        revisar(ctx);
        ctx.repasar();
      }
    }, 110);
  } else if (!cerca && e.chupando) {
    pararDeChupar(ctx);
  }
}

function pararDeChupar(ctx) {
  if (!e.chupando) return;
  clearInterval(e.chupando);
  e.chupando = null;
  caraDeSiempre(ctx);
}

// ---------- Servilleta ----------

function limpiar(p, ctx) {
  const l = ctx.aBebe(p);
  let cambio = false;
  for (const m of e.manchas) {
    if (dist([m.x, m.y], l) < 44) {
      m.vida -= 0.14;
      cambio = true;
    }
  }
  if (!cambio) return;
  const ahora = performance.now();
  if (ahora - e.ultimoSonido > 140) {
    ctx.sonido.frotar();
    e.ultimoSonido = ahora;
  }
  const antes = e.manchas.length;
  e.manchas = e.manchas.filter((m) => m.vida > 0);
  ctx.bebe.manchas(e.manchas);
  if (antes && !e.manchas.length) ctx.chispas(ctx.deBebe([0, -260]));
  ctx.repasar();
}

// ---------- Eructo ----------

function revisar(ctx) {
  if (e.cucharadas >= CUCHARADAS && e.leche <= 0 && e.eructo === 'no') {
    e.eructo = 'pendiente';
    e.palmadas = 0;
    ctx.bebe.hipo(true);
    caraDeSiempre(ctx);
  }
}

function palmadita(ctx) {
  e.palmadas++;
  ctx.bebe.animar('palmada');
  ctx.sonido.palmada();
  if (e.palmadas < 3) return;
  e.eructo = 'hecho';
  ctx.bebe.hipo(false);
  setTimeout(() => {
    if (!e) return;
    ctx.sonido.eructo();
    ctx.bebe.expresion('abiertos', 'abierta', 650);
    setTimeout(() => {
      if (!e) return;
      caraDeSiempre(ctx);
      ctx.terminar();
    }, 700);
  }, 250);
}

export default {
  id: 'comer',
  herramientas: ['cuchara', 'biberon', 'servilleta'],

  icono(id) {
    if (id === 'cuchara') return HERRAMIENTAS.cuchara.icono(e.llena, e.color);
    if (id === 'biberon') return HERRAMIENTAS.biberon.icono(e.leche);
    return HERRAMIENTAS[id].icono();
  },

  entrar(ctx) {
    e = {
      cucharadas: 0, llena: false, leche: 1, eructo: 'no', palmadas: 0,
      manchas: [], color: azar(SABORES), chupando: null, ultimoSonido: 0,
    };
    caraDeSiempre(ctx);
    plato(ctx);
  },

  salir(ctx) {
    pararDeChupar(ctx);
    e = null;
  },

  alMover(id, p, ctx) {
    if (id === 'cuchara') moverCuchara(p, ctx);
    else if (id === 'biberon') moverBiberon(p, ctx);
    else if (id === 'servilleta') limpiar(p, ctx);
  },

  alSoltar(id, p, ctx) {
    pararDeChupar(ctx);
    caraDeSiempre(ctx);
  },

  alTocar(p, ctx) {
    if (!ctx.bebe.contiene(ctx.aBebe(p))) return;
    if (e.eructo === 'pendiente') palmadita(ctx);
    else ctx.cosquillas();
  },

  pista(ctx) {
    if (!e) return null;
    if (e.eructo === 'pendiente') return { tocar: ctx.deBebe([0, -150]) };
    if (e.cucharadas < CUCHARADAS) {
      return { herramienta: 'cuchara', hasta: e.llena ? [boca(ctx)] : [PLATO, boca(ctx)] };
    }
    if (e.leche > 0) return { herramienta: 'biberon', hasta: [boca(ctx)], sostener: true };
    if (e.manchas.length) {
      const m = e.manchas[0];
      return { herramienta: 'servilleta', hasta: [ctx.deBebe([m.x, m.y])], frotar: true };
    }
    return null;
  },
};
