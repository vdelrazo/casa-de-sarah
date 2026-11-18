# Casa de Sarah

Juego de **cuidar a un bebé**, en caricatura, para niñas de **4 a 6 años**.
Se juega en los mismos iPads que `juego-manejo`: se abre en Safari y se agrega a la
pantalla de inicio, sin pasar por el App Store. Se publica con GitHub Pages:
https://vdelrazo.github.io/casa-de-sarah/ (repo `vdelrazo/casa-de-sarah`; la carpeta local
se sigue llamando `juego-barbies`).

Este archivo es la fuente de verdad del diseño. Si una decisión cambia,
actualízala aquí.

## Historia

- 2026-11-17: primera versión, un vestidor de muñecas. Funcionó, pero entretuvo poco y la niña
  dijo que prefería un bebé.
- 2026-11-18: el juego cambia a cuidar a un bebé. **El vestidor y la muñeca se quitaron por
  completo** (siguen en el historial de git, commit `e627b8e`, por si se quieren reusar).

## Forma de trabajar

- Antes de cambios que toquen varios archivos, proponer un plan y esperar aprobación.
- Avanzar por fases (ver abajo); cada fase termina con algo jugable en el iPad.
- Probar en el iPad real: el navegador de Windows no suena ni se toca igual que Safari en iOS.

## Reglas del juego (decididas 2026-11-18)

### Público: niñas de 4 a 6 años
- **El juego no depende de leer.** Todo se entiende con dibujos, colores, animaciones y sonidos.
- **El bebé no habla:** se comunica con risitas, balbuceos, pucheros, bostezos y eructos hechos
  con sonido. La voz del navegador no les gustó, así que el juego no la usa.
- Botones grandes (80 px o más) y separados entre sí.
- **Nunca pasa nada malo.** Si no se atiende al bebé, solo hace pucheritos; no llora sin parar,
  no se enferma y no hay "game over".

### Cómo se juega
- Abajo hay botones grandes con dibujos: casa, comer, bañar, vestir y dormir (después: pañal y jugar).
  Se puede ir a cualquiera cuando se quiera.
- **El bebé pide cosas** con una burbuja con dibujo (biberón, patito, mameluco, luna). El botón de
  lo que pide late. Tocar la burbuja lleva directo a esa actividad.
  Pide en ciclo: comer → bañar → vestir → dormir → comer…
- Las herramientas de cada actividad están a un lado (o arriba, con el iPad parado) y se
  **arrastran con el dedo** hasta el bebé. La que toca usar brilla, y si la niña no hace nada
  unos segundos, una manita le muestra el movimiento.
- Cada actividad terminada da una **estrellita** (se guardan en el iPad) y el bebé se ríe.

### Actividades
- **Casa:** el bebé en su tapete. Si se le toca, le dan cosquillas y se ríe.
- **Comer** (silla alta, con babero): la cuchara se llena en el plato y se lleva a la boca
  (4 cucharadas; a veces se embarra la cara y se limpia con la servilleta). Luego el biberón:
  se sostiene en la boca hasta que se vacía. Al final, palmaditas en la espalda hasta que eructa.
- **Bañar** (tina): el bebé llega con manchas de lodo. El jabón hace espuma y quita el lodo,
  la regadera quita la espuma y la toalla lo seca. El patito suena si se toca.
  Al terminar el baño la ropa se va a lavar: el bebé queda en pañal hasta que lo vistan.
- **Vestir** (cambiador, decidido 2026-11-18): ropero con 3 cajones: ropa (8 mamelucos y
  vestidos), cabeza (6) y pies (5). **La ropa se pone solo arrastrándola hasta el bebé**
  (tocar no la pone; solo hace que la manita enseñe a arrastrar).
  Para quitarla, se jala la prenda del bebé hacia afuera; si se suelta sobre el bebé, se queda.
  Una prenda por lugar: la nueva reemplaza a la anterior. Sin ropa, el bebé queda en pañal.
  Estrella al dejarlo con ropa y algo en los pies. La ropa se ve en la casa y al comer
  (con babero encima); al dormir solo se ve lo de la cabeza. Se guarda en el iPad.
- **Dormir** (moisés): se mece la cuna arrastrando el dedo de lado a lado; cada mecida toca la
  canción de cuna y le da más sueño (bosteza, se le cierran los ojos). El chupón ayuda.
  Ya dormido, se apaga la lámpara. Un sol grande lo despierta.
- **Pañal** (fase 2): con popó de caricatura. Quitar el sucio, limpiar, talco, pañal nuevo.

### Estilo
- **Caricatura dibujada en el código** (SVG): contornos suaves, colores pastel, cabeza grande.
- Personajes originales; nada de marcas ni personajes conocidos.
- Funciona con el iPad vertical u horizontal.

## Decisiones técnicas

- **HTML + JavaScript (módulos ES) + SVG**, sin paso de compilación: lo que está en `main` es lo que se publica.
- El fondo de cada lugar es un SVG de 1000 × 1000 que se recorta para llenar la pantalla (`js/escenas.js`).
- El bebé y los muebles van en otro SVG de 600 × 640 (`#escena`), así la tina, la silla
  y la cuna siempre coinciden con el bebé. El bebé (`js/bebe.js`) se dibuja con el punto
  (0, 0) entre sus pompis; cada lugar lo coloca con `translate`.
- Cada actividad es un módulo (`js/casa.js`, `js/comer.js`, `js/banar.js`, `js/vestir.js`,
  `js/dormir.js`) con la misma forma: `entrar`, `salir`, `alMover` / `alSoltar` (herramienta
  arrastrada), `alTocar` / `alArrastrar` (toques en la escena) y `pista` (qué sugerir).
  `vestir` dibuja su propio ropero con `panel` en lugar de herramientas.
- La ropa del bebé está en `js/ropa-bebe.js`; cada prenda regresa sus partes (torso, piernas,
  mangas, capucha, sombrero, pies) en coordenadas del bebé. `bebe.js` las pone en su capa.
- Sonidos generados con Web Audio, sin archivos de audio. iOS no suena hasta el primer toque:
  el ▶ de la pantalla de inicio desbloquea el audio.
- Lo que se guarda en el iPad (`localStorage`): estrellas, qué está pidiendo el bebé y su ropa.
- `?depurar` al final de la dirección deja `window.__juego` para revisar el estado.
- **GitHub Pages** se publica desde la raíz de la rama `main`. `.nojekyll` evita que Jekyll procese los archivos.

## Fases

1. **Bebé, comer, bañar y dormir**, con burbuja de pedidos, pistas y estrellas. *Hecha el 2026-11-18.*
2. **Vestir al bebé** arrastrando la ropa. *Hecha el 2026-11-18.*
3. **Pañal y jugar** (sonaja, "¿dónde está el bebé?", burbujas).
4. **Escoger su bebé:** tono de piel, pelito, niño o niña.
5. **Álbum de estampas** y salir a pasear en carriola.
6. **Instalable:** PWA sin internet y música.

## Preguntas abiertas

- Probar la fase 1 en el iPad: ¿se entiende arrastrar las herramientas? ¿la manita ayuda?
  ¿los sonidos del bebé dan risa o molestan?
