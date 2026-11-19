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
- Abajo hay botones grandes con dibujos: jugar, comer, pañal, bañar, vestir y dormir.
  Se puede ir a cualquiera cuando se quiera. (El botón de "casa" se volvió "jugar" el 2026-11-18.)
- **El bebé pide cosas** con una burbuja con dibujo (biberón, pañal, patito, mameluco, sonaja, luna).
  El botón de lo que pide late. Tocar la burbuja lleva directo a esa actividad.
  Pide en ciclo, como un día de bebé: comer → pañal → bañar → vestir → jugar → dormir → comer…
- Las herramientas de cada actividad están a un lado (o arriba, con el iPad parado) y se
  **arrastran con el dedo** hasta el bebé. La que toca usar brilla, y si la niña no hace nada
  unos segundos, una manita le muestra el movimiento.
- Cada actividad terminada da una **estrellita** (se guardan en el iPad) y el bebé se ríe.

### Actividades
- **Jugar** (su tapete): mantita para "¿dónde está el bebé?" (se le pone en la cara y al tocarla
  sale volando y el bebé se carcajea), burbujero (al moverlo salen burbujas que se revientan),
  sonaja (suena al moverla; si se suelta en el bebé, la agarra y la sacude) y la pelota del
  tapete rebota si se toca. Estrella al hacer 3 juegos distintos. Cosquillas al tocar al bebé.
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
- **Pañal** (cambiador, sin ropa mientras tanto): el pañal sucio tiene rayitas de olor y una mosquita
  (que se espanta si se toca). Se jala el pañal del bebé y vuela solo al bote, enseñando la
  **popó de caricatura**. Luego toallitas para limpiar las manchitas, talco (opcional) y el pañal
  limpio, que no se pone hasta que esté limpio (si no, el bebé hace pucherito y la pista guía).
  Estrella al ponerle el pañal limpio. Cuando el bebé pide pañal, a veces hace "pfff".

### Cámara y álbum
- Arriba a la izquierda, junto a las estrellas: botón de **cámara** (en cualquier lugar) y de
  **álbum**. La foto es la escena como se ve (fondo, muebles y bebé), con flash y sonido.
- El álbum muestra las fotos en marquitos; tocar una la agranda. Se guardan las últimas 24 en el
  iPad (`localStorage`, JPG chicas). No se borran desde el juego.

### Estilo
- **Caricatura dibujada en el código** (SVG): contornos suaves, colores pastel, cabeza grande.
- Personajes originales; nada de marcas ni personajes conocidos.
- Funciona con el iPad vertical u horizontal.

## Decisiones técnicas

- **HTML + JavaScript (módulos ES) + SVG**, sin paso de compilación: lo que está en `main` es lo que se publica.
- El fondo de cada lugar es un SVG de 1600 × 1000 que se recorta para llenar la pantalla (`js/escenas.js`).
- El bebé y los muebles van en otro SVG de 600 × 640 (`#escena`), así la tina, la silla
  y la cuna siempre coinciden con el bebé. El bebé (`js/bebe.js`) se dibuja con el punto
  (0, 0) entre sus pompis; cada lugar lo coloca con `translate`.
- Cada actividad es un módulo (`js/jugar.js`, `js/comer.js`, `js/panal.js`, `js/banar.js`,
  `js/vestir.js`, `js/dormir.js`) con la misma forma: `entrar`, `salir`, `alMover` / `alSoltar` (herramienta
  arrastrada), `alTocar` / `alArrastrar` (toques en la escena) y `pista` (qué sugerir).
  `vestir` dibuja su propio ropero con `panel` en lugar de herramientas.
- La ropa del bebé está en `js/ropa-bebe.js`; cada prenda regresa sus partes (torso, piernas,
  mangas, capucha, sombrero, pies) en coordenadas del bebé. `bebe.js` las pone en su capa.
- Las pompas de jabón (baño y burbujero) están en `js/pompas.js`.
- La cámara (`js/camara.js`) copia los dos SVG con sus estilos ya calculados, los dibuja en un
  canvas y guarda un JPG.
- Sonidos generados con Web Audio, sin archivos de audio. iOS no suena hasta el primer toque:
  el ▶ de la pantalla de inicio desbloquea el audio.
- Lo que se guarda en el iPad (`localStorage`): estrellas, qué está pidiendo el bebé y su ropa.
- `?depurar` al final de la dirección deja `window.__juego` para revisar el estado.
- **GitHub Pages** se publica desde la raíz de la rama `main`. `.nojekyll` evita que Jekyll procese los archivos.

## Fases

1. **Bebé, comer, bañar y dormir**, con burbuja de pedidos, pistas y estrellas. *Hecha el 2026-11-18.*
2. **Vestir al bebé** arrastrando la ropa. *Hecha el 2026-11-18.*
3. **Pañal, jugar y cámara** con álbum. *Hechas el 2026-11-18.*
4. Ideas pendientes (2026-11-18): regalo sorpresa cada 5 estrellas, escoger su bebé (piel, pelito,
   niño o niña), doctor de curitas, peinados de espuma en el baño, cocinar la papilla, paseo en carriola.
5. **Instalable:** PWA sin internet y música.

## Preguntas abiertas

- Probar en el iPad: ¿se entiende arrastrar las herramientas? ¿la manita ayuda?
  ¿los sonidos del bebé dan risa o molestan?
- **Cámara en Safari:** probada solo en Chrome de Windows. Revisar en el iPad que la foto salga
  completa (colores, estampados, cara) y que el álbum se guarde al cerrar y abrir el juego.
