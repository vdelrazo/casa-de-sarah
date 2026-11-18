// El cuarto de Sarah, detrás de la muñeca. Lienzo de 1000 × 1000 que se recorta
// para llenar el escenario (por eso lo importante va entre x = 150 y x = 850).

function banderines() {
  const colores = ['#ff8cc6', '#ffd84d', '#8fdcc0', '#b49cff', '#7cc7ff'];
  let s = '<path d="M -20 40 Q 500 130 1020 40" fill="none" stroke="#d68fb5" stroke-width="4"/>';
  const n = 14;
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const x = (1 - t) * (1 - t) * -20 + 2 * (1 - t) * t * 500 + t * t * 1020;
    const y = (1 - t) * (1 - t) * 40 + 2 * (1 - t) * t * 130 + t * t * 40;
    s += `<path d="M ${x - 26} ${y - 3} L ${x + 26} ${y - 3} L ${x} ${y + 48} Z" fill="${colores[i % colores.length]}"/>`;
  }
  return s;
}

export function dibujarCuarto(svg) {
  svg.setAttribute('viewBox', '0 0 1000 1000');
  svg.setAttribute('preserveAspectRatio', 'xMidYMax slice');
  svg.innerHTML = `
    <defs>
      <pattern id="papel-tapiz" patternUnits="userSpaceOnUse" width="80" height="80">
        <rect width="80" height="80" fill="#ffe6f1"/>
        <rect width="40" height="80" fill="#ffdcec"/>
        <circle cx="20" cy="20" r="4" fill="#ffffff" opacity="0.8"/>
        <circle cx="60" cy="60" r="4" fill="#ffffff" opacity="0.8"/>
      </pattern>
      <pattern id="duela" patternUnits="userSpaceOnUse" width="240" height="50">
        <rect width="240" height="50" fill="#f3cf9f"/>
        <path d="M 0 49 L 240 49 M 80 0 L 80 25 M 200 25 L 200 50" stroke="#ddb07a" stroke-width="3"/>
        <path d="M 0 24 L 240 24" stroke="#e7bf8a" stroke-width="2"/>
      </pattern>
    </defs>

    <rect width="1000" height="1000" fill="url(#papel-tapiz)"/>
    ${banderines()}

    <!-- Ventana con sol y nube -->
    <rect x="160" y="150" width="200" height="230" rx="18" fill="#ffffff" stroke="#e6a8c8" stroke-width="6"/>
    <rect x="176" y="166" width="168" height="198" rx="10" fill="#bfe8ff"/>
    <circle cx="300" cy="212" r="26" fill="#ffd84d"/>
    <g fill="#ffffff">
      <circle cx="220" cy="300" r="20"/><circle cx="246" cy="290" r="26"/><circle cx="274" cy="304" r="18"/>
      <rect x="204" y="300" width="86" height="20" rx="10"/>
    </g>
    <path d="M 260 166 L 260 364 M 176 265 L 344 265" stroke="#ffffff" stroke-width="10"/>
    <rect x="132" y="132" width="256" height="12" rx="6" fill="#d18ab0"/>
    <path d="M 140 138 L 214 138 Q 190 260 220 392 Q 172 404 140 392 Z" fill="#ff9ccf" stroke="#e07ab0" stroke-width="4"/>
    <path d="M 380 138 L 306 138 Q 330 260 300 392 Q 348 404 380 392 Z" fill="#ff9ccf" stroke="#e07ab0" stroke-width="4"/>

    <!-- Letrero con el nombre -->
    <path d="M 690 170 L 750 128 L 810 170" fill="none" stroke="#c89bff" stroke-width="4"/>
    <circle cx="750" cy="126" r="7" fill="#b07cff"/>
    <rect x="640" y="168" width="220" height="112" rx="24" fill="#ffffff" stroke="#c89bff" stroke-width="8"/>
    <text x="750" y="240" text-anchor="middle" font-size="60" font-weight="800"
      font-family="ui-rounded, 'Arial Rounded MT Bold', 'Trebuchet MS', system-ui, sans-serif" fill="#e0418f">Sarah</text>

    <!-- Piso -->
    <rect x="0" y="790" width="1000" height="210" fill="url(#duela)"/>
    <rect x="0" y="780" width="1000" height="16" fill="#ffffff"/>
    <ellipse cx="500" cy="936" rx="280" ry="50" fill="#c9b6ff"/>
    <ellipse cx="500" cy="936" rx="250" ry="38" fill="none" stroke="#ffffff" stroke-width="5" stroke-dasharray="14 12"/>

    <!-- Planta -->
    <path d="M 812 700 Q 790 640 800 600 Q 822 640 826 700 Z" fill="#6fcf7f"/>
    <path d="M 826 700 Q 840 630 872 610 Q 862 660 836 704 Z" fill="#5cbc6e"/>
    <path d="M 818 704 Q 776 670 760 640 Q 800 650 828 700 Z" fill="#7fdc8f"/>
    <path d="M 784 700 L 856 700 L 846 790 L 794 790 Z" fill="#ff9f80" stroke="#e07c5c" stroke-width="4"/>

    <!-- Pelota -->
    <circle cx="200" cy="840" r="34" fill="#ffd84d" stroke="#e0b400" stroke-width="4"/>
    <path d="M 168 828 Q 200 846 232 828 M 172 858 Q 200 840 228 858" fill="none" stroke="#ff6fb3" stroke-width="6"/>
  `;
}
