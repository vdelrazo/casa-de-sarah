// Sonido y voz. Todo se genera en el navegador: no hay archivos de audio.
// iOS no deja sonar nada hasta el primer toque, por eso iniciarAudio() se llama
// al tocar ▶, y la primera frase de voz también se dice ahí.

let ctx = null;

export function iniciarAudio() {
  // Que suene aunque el iPad esté en modo silencio (Safari 16.4 o más nuevo).
  try {
    if (navigator.audioSession) navigator.audioSession.type = 'playback';
  } catch { /* no pasa nada */ }

  const ContextoAudio = window.AudioContext || window.webkitAudioContext;
  if (!ContextoAudio) return;
  if (!ctx) ctx = new ContextoAudio();
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
  if (document.visibilityState === 'hidden') ctx.suspend().catch(() => {});
  else ctx.resume().catch(() => {});
});

// ---------- Efectos cortos ----------

function tono({ frec, hasta = frec, inicio = 0, dur = 0.15, tipo = 'sine', vol = 0.15 }) {
  if (!ctx) return;
  const t = ctx.currentTime + inicio;
  const osc = ctx.createOscillator();
  osc.type = tipo;
  osc.frequency.setValueAtTime(frec, t);
  if (hasta !== frec) osc.frequency.exponentialRampToValueAtTime(hasta, t + dur);
  const vol0 = ctx.createGain();
  vol0.gain.setValueAtTime(0.0001, t);
  vol0.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  vol0.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(vol0).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.03);
}

/** Brillitos al ponerse una prenda: cuatro notas que suben. */
export function sonidoPoner() {
  [1047, 1319, 1568, 2093].forEach((f, i) =>
    tono({ frec: f, inicio: i * 0.055, dur: 0.28, tipo: 'triangle', vol: 0.12 }));
}

/** "Fiuuu" al quitarse una prenda. */
export const sonidoQuitar = () => tono({ frec: 1100, hasta: 280, dur: 0.22, vol: 0.14 });

/** "Pop" al cambiar de cajón. */
export const sonidoPestana = () => tono({ frec: 420, hasta: 760, dur: 0.09, vol: 0.18 });

/** Al levantar una prenda para arrastrarla. */
export const sonidoTomar = () => tono({ frec: 700, hasta: 1000, dur: 0.07, vol: 0.12 });

/** El dado rueda y luego suena un "¡ta-dá!". */
export function sonidoDado() {
  for (let i = 0; i < 7; i++) {
    tono({ frec: 500 + Math.random() * 500, inicio: i * 0.07, dur: 0.05, tipo: 'square', vol: 0.04 });
  }
  [523, 659, 784, 1047].forEach((f, i) =>
    tono({ frec: f, inicio: 0.55 + i * 0.04, dur: 0.5, tipo: 'triangle', vol: 0.1 }));
}

/** Risita: "ji-ji-ji-ji". */
export function sonidoRisa() {
  for (let i = 0; i < 5; i++) {
    const f = 950 + (i % 2) * 140 - i * 25;
    tono({ frec: f, hasta: f * 1.3, inicio: i * 0.11, dur: 0.08, vol: 0.15 });
  }
}

// ---------- Voz ----------

let voz = null;

function elegirVoz() {
  const voces = speechSynthesis.getVoices();
  voz = voces.find((v) => v.lang.replace('_', '-') === 'es-MX')
    || voces.find((v) => v.lang.startsWith('es'))
    || null;
}

if ('speechSynthesis' in window) {
  elegirVoz();
  speechSynthesis.addEventListener?.('voiceschanged', elegirVoz);
}

export function decir(texto) {
  if (!('speechSynthesis' in window)) return;
  if (speechSynthesis.speaking) speechSynthesis.cancel();
  const frase = new SpeechSynthesisUtterance(texto);
  frase.lang = 'es-MX';
  if (voz) frase.voice = voz;
  frase.rate = 0.95;
  frase.pitch = 1.3;   // voz de muñeca
  speechSynthesis.speak(frase);
}
