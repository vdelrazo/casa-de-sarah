// Sonidos del juego. Todo se genera en el navegador: no hay archivos de audio.
// El bebé no habla: se ríe, balbucea, hace pucheros, bosteza y eructa.
// iOS no deja sonar nada hasta el primer toque, por eso iniciarAudio() se llama al tocar ▶.

let ctx = null;
let ruidoBlanco = null;

export function iniciarAudio() {
  // Que suene aunque el iPad esté en modo silencio (Safari 16.4 o más nuevo).
  try {
    if (navigator.audioSession) navigator.audioSession.type = 'playback';
  } catch { /* no pasa nada */ }

  const ContextoAudio = window.AudioContext || window.webkitAudioContext;
  if (!ContextoAudio) return;
  if (!ctx) {
    ctx = new ContextoAudio();
    ruidoBlanco = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const datos = ruidoBlanco.getChannelData(0);
    for (let i = 0; i < datos.length; i++) datos[i] = Math.random() * 2 - 1;
  }
  if (ctx.state !== 'running') ctx.resume().catch(() => {});
}

// Si iOS pausó el audio (por ejemplo, al salir y volver a la app), el siguiente toque lo despierta.
document.addEventListener('pointerdown', () => {
  if (ctx && ctx.state !== 'running' && document.visibilityState === 'visible') {
    ctx.resume().catch(() => {});
  }
});
document.addEventListener('visibilitychange', () => {
  if (!ctx) return;
  if (document.visibilityState === 'hidden') {
    agua(false);
    ctx.suspend().catch(() => {});
  } else {
    ctx.resume().catch(() => {});
  }
});

// ---------- Piezas ----------

/** Una nota con subida rápida y caída suave. `vibrato` en Hz de profundidad. */
function tono({ frec, hasta = frec, inicio = 0, dur = 0.15, tipo = 'sine', vol = 0.15, vibrato = 0, filtro = 0 }) {
  if (!ctx) return;
  const t = ctx.currentTime + inicio;
  const osc = ctx.createOscillator();
  osc.type = tipo;
  osc.frequency.setValueAtTime(frec, t);
  if (hasta !== frec) osc.frequency.exponentialRampToValueAtTime(hasta, t + dur);

  if (vibrato) {
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 7;
    const profundidad = ctx.createGain();
    profundidad.gain.value = vibrato;
    lfo.connect(profundidad).connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + dur + 0.05);
  }

  const volumen = ctx.createGain();
  volumen.gain.setValueAtTime(0.0001, t);
  volumen.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  volumen.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  let salida = osc;
  if (filtro) {
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = filtro;
    salida = osc.connect(f);
  }
  salida.connect(volumen).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

/** Un soplido de ruido filtrado (agua, tallar, palmadas). */
function soplo({ inicio = 0, dur = 0.1, frec = 1500, tipo = 'bandpass', vol = 0.1, q = 1 }) {
  if (!ctx) return;
  const t = ctx.currentTime + inicio;
  const fuente = ctx.createBufferSource();
  fuente.buffer = ruidoBlanco;
  const f = ctx.createBiquadFilter();
  f.type = tipo;
  f.frequency.value = frec;
  f.Q.value = q;
  const volumen = ctx.createGain();
  volumen.gain.setValueAtTime(0.0001, t);
  volumen.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  volumen.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  fuente.connect(f).connect(volumen).connect(ctx.destination);
  fuente.start(t, Math.random() * 0.5);
  fuente.stop(t + dur + 0.05);
}

// ---------- El bebé ----------

/** Risita de bebé: "ji-ji-ji-ji-ji". */
export function risa() {
  for (let i = 0; i < 6; i++) {
    const f = 1150 + (i % 2) * 160 - i * 35;
    tono({ frec: f, hasta: f * 1.3, inicio: i * 0.1, dur: 0.075, vol: 0.14, tipo: 'triangle' });
  }
}

/** "Ba-ba": dos sílabas que suben. */
export function balbuceo() {
  const base = 380 + Math.random() * 80;
  tono({ frec: base, hasta: base * 1.25, dur: 0.14, tipo: 'triangle', vol: 0.16, filtro: 1400 });
  tono({ frec: base * 1.1, hasta: base * 1.45, inicio: 0.2, dur: 0.18, tipo: 'triangle', vol: 0.16, filtro: 1400 });
}

/** Pucherito suave: "ñeee" que baja. Nunca un llanto fuerte. */
export function puchero() {
  tono({ frec: 560, hasta: 400, dur: 0.6, tipo: 'triangle', vol: 0.11, vibrato: 18, filtro: 1600 });
}

export function bostezo() {
  tono({ frec: 520, hasta: 250, dur: 1.0, tipo: 'triangle', vol: 0.13, vibrato: 10, filtro: 1200 });
}

/** "Ñam ñam" al comer. */
export function nam() {
  tono({ frec: 280, hasta: 220, dur: 0.12, vol: 0.2, filtro: 900, tipo: 'triangle' });
  tono({ frec: 300, hasta: 230, inicio: 0.18, dur: 0.12, vol: 0.2, filtro: 900, tipo: 'triangle' });
}

/** Tragar leche: "glup". */
export const trago = () => tono({ frec: 460, hasta: 170, dur: 0.09, vol: 0.18 });

/** Eructo de caricatura. */
export function eructo() {
  tono({ frec: 110, hasta: 62, dur: 0.55, tipo: 'sawtooth', vol: 0.3, vibrato: 14, filtro: 500 });
  soplo({ dur: 0.4, frec: 300, tipo: 'lowpass', vol: 0.12 });
}

/** Palmadita en la espalda. */
export const palmada = () => soplo({ dur: 0.07, frec: 700, tipo: 'lowpass', vol: 0.35 });

// ---------- Cosas ----------

export const plop = () => tono({ frec: 260, hasta: 520, dur: 0.08, vol: 0.18 });
export const pop = () => tono({ frec: 700 + Math.random() * 300, hasta: 1500, dur: 0.05, vol: 0.12 });
export const tallar = () => soplo({ dur: 0.09, frec: 2600 + Math.random() * 800, vol: 0.06, q: 0.8 });
export const frotar = () => soplo({ dur: 0.12, frec: 900, vol: 0.07, q: 0.6 });
export const click = () => tono({ frec: 1800, hasta: 1200, dur: 0.03, tipo: 'square', vol: 0.06 });
export const tomar = () => tono({ frec: 700, hasta: 1000, dur: 0.07, vol: 0.12 });
export const boton = () => tono({ frec: 420, hasta: 760, dur: 0.09, vol: 0.16 });

export function patito() {
  tono({ frec: 950, hasta: 1500, dur: 0.09, tipo: 'square', vol: 0.06, filtro: 2500 });
  tono({ frec: 1500, hasta: 900, inicio: 0.09, dur: 0.12, tipo: 'square', vol: 0.06, filtro: 2500 });
}

/** Chorro de agua de la regadera: suena mientras está encendido. */
let chorro = null;
export function agua(encendida) {
  if (!ctx) return;
  if (encendida && !chorro) {
    const fuente = ctx.createBufferSource();
    fuente.buffer = ruidoBlanco;
    fuente.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 2200;
    const volumen = ctx.createGain();
    volumen.gain.setValueAtTime(0.0001, ctx.currentTime);
    volumen.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 0.1);
    fuente.connect(f).connect(volumen).connect(ctx.destination);
    fuente.start();
    chorro = { fuente, volumen };
  } else if (!encendida && chorro) {
    const { fuente, volumen } = chorro;
    volumen.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05);
    fuente.stop(ctx.currentTime + 0.3);
    chorro = null;
  }
}

/** Premio: cuatro notas que suben. */
export function estrella() {
  [1047, 1319, 1568, 2093].forEach((f, i) =>
    tono({ frec: f, inicio: i * 0.07, dur: 0.35, tipo: 'triangle', vol: 0.12 }));
}

/** Brillitos al ponerle una prenda. */
export function ponerRopa() {
  [784, 988, 1175, 1568].forEach((f, i) =>
    tono({ frec: f, inicio: i * 0.05, dur: 0.25, tipo: 'triangle', vol: 0.11 }));
}

/** "Fiuuu" al quitarle una prenda. */
export const quitarRopa = () => tono({ frec: 1100, hasta: 300, dur: 0.22, vol: 0.13 });

export function despertar() {
  [523, 659, 784, 1047, 1319].forEach((f, i) =>
    tono({ frec: f, inicio: i * 0.08, dur: 0.3, tipo: 'triangle', vol: 0.1 }));
}

// ---------- Canción de cuna ----------
// Melodía original, en 3/4. Cada mecida de la cuna toca un compás (tres notas).

const CUNA = [
  [67, 1], [64, 1], [67, 1], [64, 1], [60, 1], [62, 1], [64, 1], [65, 1], [67, 1], [64, 3],
  [69, 1], [67, 1], [65, 1], [64, 1], [62, 1], [60, 1], [62, 1], [64, 1], [62, 1], [60, 3],
];
let notaCuna = 0;

/** Toca el siguiente compás de la canción de cuna, como cajita musical. */
export function compasCuna() {
  if (!ctx) return;
  let tiempo = 0;
  let pulsos = 0;
  while (pulsos < 3) {
    const [midi, largo] = CUNA[notaCuna];
    notaCuna = (notaCuna + 1) % CUNA.length;
    const frec = 440 * 2 ** ((midi + 12 - 69) / 12);
    tono({ frec, inicio: tiempo, dur: 0.9 * largo, tipo: 'sine', vol: 0.12 });
    tono({ frec: frec * 2, inicio: tiempo, dur: 0.3, tipo: 'sine', vol: 0.03 });
    tiempo += 0.32 * largo;
    pulsos += largo;
  }
}
