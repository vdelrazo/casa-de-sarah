// Los lugares de la casa. Cada uno tiene:
//   - fondo: SVG de 1600 × 1000 (x de -300 a 1300) que se recorta para llenar la pantalla;
//     lo importante va entre x = 150 y x = 850, que es lo que se ve con el iPad parado;
//   - muebles: en el lienzo de la escena (600 × 640), detrás (atras) y delante (frente) del bebé,
//     más los que no se mecen con la cuna (fijos);
//   - bebe: dónde se sienta o se acuesta el bebé.

// ---------- Fondos ----------

const PISO_MADERA = `
  <rect x="-300" y="800" width="1600" height="200" fill="url(#duela)"/>
  <rect x="-300" y="788" width="1600" height="16" fill="#ffffff"/>`;

const DEFS_FONDO = `
  <defs>
    <pattern id="duela" patternUnits="userSpaceOnUse" width="240" height="50">
      <rect width="240" height="50" fill="#f3cf9f"/>
      <path d="M 0 49 L 240 49 M 80 0 L 80 25 M 200 25 L 200 50" stroke="#ddb07a" stroke-width="3"/>
    </pattern>
    <pattern id="papel-cuarto" patternUnits="userSpaceOnUse" width="90" height="90">
      <rect width="90" height="90" fill="#def5ec"/>
      <circle cx="22" cy="22" r="5" fill="#ffffff" opacity="0.85"/>
      <path d="M 67 58 L 69.6 63.6 L 75.6 64.2 L 71 68.2 L 72.4 74 L 67 71 L 61.6 74 L 63 68.2 L 58.4 64.2 L 64.4 63.6 Z" fill="#fff3b0"/>
    </pattern>
    <pattern id="azulejo-cocina" patternUnits="userSpaceOnUse" width="60" height="60">
      <rect width="60" height="60" fill="#ffffff"/>
      <rect width="30" height="30" fill="#ffe0ec"/><rect x="30" y="30" width="30" height="30" fill="#ffe0ec"/>
    </pattern>
    <pattern id="piso-cocina" patternUnits="userSpaceOnUse" width="100" height="100">
      <rect width="100" height="100" fill="#fff6e6"/>
      <rect width="50" height="50" fill="#ffd9a8"/><rect x="50" y="50" width="50" height="50" fill="#ffd9a8"/>
    </pattern>
    <pattern id="azulejo-bano" patternUnits="userSpaceOnUse" width="80" height="80">
      <rect width="80" height="80" fill="#e3f4ff" stroke="#c4e3f8" stroke-width="4"/>
    </pattern>
    <pattern id="piso-bano" patternUnits="userSpaceOnUse" width="100" height="100">
      <rect width="100" height="100" fill="#ffffff"/>
      <rect width="50" height="50" fill="#bfe3fb"/><rect x="50" y="50" width="50" height="50" fill="#bfe3fb"/>
    </pattern>
  </defs>`;

const VENTANA = (x, y, cortina) => `
  <rect x="${x}" y="${y}" width="200" height="230" rx="18" fill="#ffffff" stroke="#e6c3d6" stroke-width="6"/>
  <rect x="${x + 16}" y="${y + 16}" width="168" height="198" rx="10" fill="#bfe8ff"/>
  <circle cx="${x + 140}" cy="${y + 62}" r="26" fill="#ffd84d"/>
  <g fill="#ffffff"><circle cx="${x + 60}" cy="${y + 150}" r="20"/><circle cx="${x + 86}" cy="${y + 140}" r="26"/>
    <circle cx="${x + 114}" cy="${y + 154}" r="18"/><rect x="${x + 44}" y="${y + 150}" width="86" height="20" rx="10"/></g>
  <path d="M ${x + 100} ${y + 16} L ${x + 100} ${y + 214} M ${x + 16} ${y + 115} L ${x + 184} ${y + 115}" stroke="#ffffff" stroke-width="10"/>
  <rect x="${x - 28}" y="${y - 18}" width="256" height="12" rx="6" fill="#d6a3c1"/>
  <path d="M ${x - 20} ${y - 12} L ${x + 54} ${y - 12} Q ${x + 30} ${y + 110} ${x + 60} ${y + 242} Q ${x + 12} ${y + 254} ${x - 20} ${y + 242} Z" fill="${cortina}"/>
  <path d="M ${x + 220} ${y - 12} L ${x + 146} ${y - 12} Q ${x + 170} ${y + 110} ${x + 140} ${y + 242} Q ${x + 188} ${y + 254} ${x + 220} ${y + 242} Z" fill="${cortina}"/>`;

const FONDOS = {
  cuarto: `
    <rect x="-300" width="1600" height="1000" fill="url(#papel-cuarto)"/>
    ${VENTANA(180, 170, '#c9b6ff')}
    <rect x="620" y="330" width="220" height="16" rx="6" fill="#e8b98a"/>
    <rect x="640" y="270" width="54" height="60" rx="8" fill="#ff9fc4" stroke="#e07aa5" stroke-width="4"/>
    <rect x="700" y="290" width="44" height="40" rx="8" fill="#9ad8ff" stroke="#5aa9d6" stroke-width="4"/>
    <circle cx="784" cy="300" r="28" fill="#ffd84d" stroke="#d9a81c" stroke-width="4"/>
    <path d="M 640 150 Q 740 210 840 150" fill="none" stroke="#d6a3c1" stroke-width="4"/>
    <path d="M 670 166 c -6 -6 -14 -10 -14 -16 c 0 -6 8 -8 14 -2 c 6 -6 14 -4 14 2 c 0 6 -8 10 -14 16 z" fill="#ff8cc6"/>
    <path d="M 740 184 c -6 -6 -14 -10 -14 -16 c 0 -6 8 -8 14 -2 c 6 -6 14 -4 14 2 c 0 6 -8 10 -14 16 z" fill="#b49cff"/>
    <path d="M 810 166 c -6 -6 -14 -10 -14 -16 c 0 -6 8 -8 14 -2 c 6 -6 14 -4 14 2 c 0 6 -8 10 -14 16 z" fill="#ffd84d"/>
    ${PISO_MADERA}`,

  cocina: `
    <rect x="-300" width="1600" height="1000" fill="#fff3d6"/>
    ${VENTANA(170, 150, '#ffb3d1')}
    <rect x="560" y="120" width="300" height="180" rx="12" fill="#bfe8d6" stroke="#8cc9ae" stroke-width="5"/>
    <path d="M 710 120 L 710 300" stroke="#8cc9ae" stroke-width="5"/>
    <circle cx="690" cy="210" r="7" fill="#8cc9ae"/><circle cx="730" cy="210" r="7" fill="#8cc9ae"/>
    <rect x="-300" y="470" width="1600" height="160" fill="url(#azulejo-cocina)"/>
    <rect x="-300" y="618" width="1600" height="28" fill="#e3b98b"/>
    <rect x="-300" y="646" width="1600" height="200" fill="#bfe8d6"/>
    <path d="M 250 646 L 250 846 M 500 646 L 500 846 M 750 646 L 750 846" stroke="#8cc9ae" stroke-width="5"/>
    <circle cx="230" cy="746" r="7" fill="#8cc9ae"/><circle cx="270" cy="746" r="7" fill="#8cc9ae"/>
    <circle cx="730" cy="746" r="7" fill="#8cc9ae"/><circle cx="770" cy="746" r="7" fill="#8cc9ae"/>
    <path d="M 700 618 Q 700 560 760 560 Q 820 560 820 618 Z" fill="#ffffff" stroke="#e3b98b" stroke-width="4"/>
    <circle cx="738" cy="582" r="16" fill="#ff6b6b"/><circle cx="770" cy="578" r="16" fill="#ffd84d"/><circle cx="790" cy="596" r="14" fill="#8ce99a"/>
    <rect x="-300" y="846" width="1600" height="154" fill="url(#piso-cocina)"/>`,

  bano: `
    <rect x="-300" width="1600" height="1000" fill="url(#azulejo-bano)"/>
    <ellipse cx="270" cy="270" rx="96" ry="120" fill="#ffffff" stroke="#9cc9e8" stroke-width="8"/>
    <ellipse cx="270" cy="270" rx="78" ry="102" fill="#d6efff"/>
    <path d="M 226 220 Q 244 196 270 190" fill="none" stroke="#ffffff" stroke-width="10" stroke-linecap="round"/>
    <rect x="660" y="300" width="200" height="12" rx="6" fill="#9aa7b8"/>
    <path d="M 690 306 L 830 306 L 830 470 Q 760 486 690 470 Z" fill="#ff9fc4" stroke="#e07aa5" stroke-width="5" stroke-linejoin="round"/>
    <path d="M 690 420 Q 760 436 830 420" fill="none" stroke="#ffffff" stroke-width="8"/>
    <g fill="#ffffff" stroke="#9ad8ff" stroke-width="4" opacity="0.9">
      <circle cx="520" cy="160" r="22"/><circle cx="580" cy="110" r="14"/><circle cx="470" cy="100" r="10"/>
    </g>
    <rect x="-300" y="830" width="1600" height="170" fill="url(#piso-bano)"/>`,
};

export function dibujarFondo(svg, lugar) {
  // Se ve de x = -300 a 1300: con el iPad acostado cabe casi todo; parado se recorta a los lados.
  svg.setAttribute('viewBox', '-300 0 1600 1000');
  svg.setAttribute('preserveAspectRatio', 'xMidYMax slice');
  svg.innerHTML = DEFS_FONDO + FONDOS[lugar];
}

// ---------- Muebles en la escena (600 × 640) ----------

const PATITO_TINA = `
  <g id="patito"><g class="flotar">
    <ellipse cx="54" cy="64" rx="34" ry="23" fill="#ffd84d" stroke="#d9a81c" stroke-width="4"/>
    <path d="M 80 52 Q 94 44 90 62" fill="#ffd84d" stroke="#d9a81c" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="38" cy="36" r="19" fill="#ffd84d" stroke="#d9a81c" stroke-width="4"/>
    <path d="M 21 38 L 6 44 L 21 49 Z" fill="#ff9f43" stroke="#e07c1c" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="35" cy="32" r="3.5" fill="#3d2b4f"/>
  </g></g>`;

export const LUGARES = {
  casa: {
    fondo: 'cuarto',
    bebe: { x: 300, y: 588, pose: 'sentado', ropa: 'mameluco' },
    atras: `
      <ellipse cx="300" cy="594" rx="270" ry="44" fill="#c9f0e0"/>
      <ellipse cx="300" cy="594" rx="238" ry="32" fill="none" stroke="#ffffff" stroke-width="5" stroke-dasharray="14 12"/>
      <rect x="40" y="540" width="60" height="60" rx="10" fill="#ff9fc4" stroke="#e07aa5" stroke-width="5"/>
      <rect x="62" y="486" width="54" height="54" rx="10" fill="#9ad8ff" stroke="#5aa9d6" stroke-width="5"/>
      <path d="M 70 570 L 76 556 L 82 570 M 72 566 L 80 566" stroke="#ffffff" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path d="M 89 498 L 92 508 L 102 509 L 94 515 L 97 525 L 89 519 L 81 525 L 84 515 L 76 509 L 86 508 Z" fill="#ffffff"/>
      <circle cx="532" cy="566" r="34" fill="#ffd84d" stroke="#d9a81c" stroke-width="5"/>
      <path d="M 500 556 Q 532 572 564 556 M 504 584 Q 532 566 560 584" fill="none" stroke="#ff6fb3" stroke-width="6"/>`,
    frente: '',
  },

  comer: {
    fondo: 'cocina',
    bebe: { x: 300, y: 540, pose: 'sentado', ropa: 'babero' },
    atras: `
      <path d="M 156 640 L 196 540 M 444 640 L 404 540" stroke="#e07aa5" stroke-width="16" stroke-linecap="round"/>
      <path d="M 186 548 L 186 250 Q 186 186 250 186 L 350 186 Q 414 186 414 250 L 414 548 Z" fill="#ff9fc4" stroke="#e07aa5" stroke-width="6" stroke-linejoin="round"/>
      <path d="M 206 540 L 206 258 Q 206 206 256 206 L 344 206 Q 394 206 394 258 L 394 540 Z" fill="#ffd0e3"/>
      <rect x="170" y="530" width="260" height="26" rx="10" fill="#ff9fc4" stroke="#e07aa5" stroke-width="6"/>`,
    frente: `
      <rect x="196" y="490" width="208" height="50" fill="#ff9fc4" stroke="#e07aa5" stroke-width="6"/>
      <path d="M 108 470 Q 108 452 126 452 L 474 452 Q 492 452 492 470 L 492 486 Q 492 502 474 502 L 126 502 Q 108 502 108 486 Z"
        fill="#ffffff" stroke="#e07aa5" stroke-width="6"/>
      <g id="plato"></g>`,
  },

  banar: {
    fondo: 'bano',
    bebe: { x: 300, y: 592, pose: 'sentado', ropa: 'nada' },
    atras: '<ellipse cx="300" cy="484" rx="262" ry="30" fill="#d9f0ff" stroke="#9cc9e8" stroke-width="5"/>',
    frente: `
      <path d="M 48 488 Q 110 470 172 488 T 296 488 T 420 488 T 552 488 L 552 512 L 48 512 Z" fill="#9ad8ff" opacity="0.92"/>
      <path d="M 36 496 L 564 496 Q 562 612 470 618 L 130 618 Q 38 612 36 496 Z" fill="#ffffff" stroke="#9cc9e8" stroke-width="6" stroke-linejoin="round"/>
      <rect x="28" y="486" width="544" height="20" rx="10" fill="#ffffff" stroke="#9cc9e8" stroke-width="6"/>
      <ellipse cx="118" cy="626" rx="24" ry="12" fill="#ffd84d" stroke="#d9a81c" stroke-width="4"/>
      <ellipse cx="482" cy="626" rx="24" ry="12" fill="#ffd84d" stroke="#d9a81c" stroke-width="4"/>
      <g fill="#ffffff" stroke="#bfe6ff" stroke-width="2.5">
        <circle cx="70" cy="482" r="14"/><circle cx="92" cy="476" r="10"/><circle cx="530" cy="480" r="13"/><circle cx="160" cy="484" r="9"/>
      </g>
      <g transform="translate(430 410) scale(0.8)">${PATITO_TINA}</g>`,
  },

  dormir: {
    fondo: 'cuarto',
    bebe: { x: 300, y: 560, pose: 'acostado', ropa: 'cobija' },
    atras: `
      <path d="M 96 432 Q 90 168 300 158 Q 510 168 504 432 Z" fill="#e9e0ff" stroke="#b49cff" stroke-width="5" stroke-linejoin="round"/>
      <path d="M 130 420 Q 126 200 300 192 Q 474 200 470 420 Z" fill="#f4efff"/>
      <path d="M 92 412 Q 300 384 508 412 L 500 440 Q 300 414 100 440 Z" fill="#f2dcb3"/>`,
    frente: `
      <path d="M 110 548 L 132 584 M 490 548 L 468 584" stroke="#c8956a" stroke-width="12" stroke-linecap="round"/>
      <path d="M 66 570 Q 300 630 534 570" fill="none" stroke="#c8956a" stroke-width="14" stroke-linecap="round"/>
      <path d="M 86 420 Q 300 452 514 420 L 496 548 Q 300 576 104 548 Z" fill="#fff1c9" stroke="#d6a86a" stroke-width="5" stroke-linejoin="round"/>
      <path d="M 96 452 Q 300 484 504 452 M 100 484 Q 300 516 500 484 M 103 516 Q 300 548 497 516" fill="none" stroke="#ecd09e" stroke-width="4"/>
      <path d="M 80 416 Q 300 448 520 416" fill="none" stroke="#ffb3d1" stroke-width="16" stroke-linecap="round"/>
      <path d="M 300 440 L 282 428 L 282 452 Z M 300 440 L 318 428 L 318 452 Z" fill="#ff8cc6" stroke="#e05f9e" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="300" cy="440" r="6" fill="#ff8cc6" stroke="#e05f9e" stroke-width="3"/>`,
    fijos: `
      <g id="lampara">
        <rect x="520" y="470" width="76" height="124" rx="8" fill="#f2c894" stroke="#c8956a" stroke-width="4"/>
        <rect x="532" y="500" width="52" height="10" rx="5" fill="#c8956a"/>
        <rect x="551" y="362" width="14" height="110" fill="#d6a86a"/>
        <circle class="foco" cx="558" cy="356" r="54" fill="#fff3b0"/>
        <path d="M 518 372 L 598 372 L 584 306 L 532 306 Z" fill="#ffd0e3" stroke="#e58fb4" stroke-width="4" stroke-linejoin="round"/>
      </g>`,
  },
};

/** Plato de papilla de la silla alta: `nivel` de 0 (vacío) a 4 (lleno). */
export function dibujarPlato(nivel, color) {
  const comida = nivel > 0
    ? `<ellipse cx="440" cy="${446 - 3 * nivel}" rx="${22 + 6 * nivel}" ry="${5 + 3 * nivel}" fill="${color}"/>`
    : '';
  return `<ellipse cx="440" cy="446" rx="50" ry="12" fill="#5fb8e8"/>${comida}
    <path d="M 389 446 Q 394 488 440 490 Q 486 488 491 446 Q 440 462 389 446 Z" fill="#8fd3ff" stroke="#4fa8dd" stroke-width="4" stroke-linejoin="round"/>`;
}
