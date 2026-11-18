# Casa de Sarah

Juego de vestir muñecas, en caricatura, para niñas de **4 a 6 años**.
Se juega en los mismos iPads que `juego-manejo`: se abre en Safari y se agrega a la
pantalla de inicio, sin pasar por el App Store. Se publica con GitHub Pages:
https://vdelrazo.github.io/casa-de-sarah/ (repo `vdelrazo/casa-de-sarah`; la carpeta local
se sigue llamando `juego-barbies`).

Este archivo es la fuente de verdad del diseño. Si una decisión cambia,
actualízala aquí.

## Forma de trabajar

- Antes de cambios que toquen varios archivos, proponer un plan y esperar aprobación.
- Avanzar por fases (ver abajo); cada fase termina con algo jugable en el iPad.
- Probar en el iPad real: el navegador de Windows no suena ni se toca igual que Safari en iOS.

## Reglas del juego (decididas 2026-11-17)

### Público: niñas de 4 a 6 años
- **El juego no depende de leer.** Todo se entiende con dibujos, colores, sonidos y voz.
  Lo que la muñeca "dice" se oye en voz alta (`speechSynthesis`, voz es-MX).
- Botones grandes (80 px o más) y separados entre sí.
- Nunca se pierde y no hay respuestas equivocadas.

### Vestidor (fase 1)
- La muñeca siempre trae una ropa básica (top y short lilas): nunca se queda sin ropa.
- **Seis cajones del ropero**, cada uno con su ícono y color: blusas, faldas y pantalones,
  vestidos, zapatos, cosas para la cabeza y accesorios. Máximo 9 prendas por cajón, para que
  quepan sin tener que deslizar.
- **Tocar una prenda se la pone; tocarla otra vez se la quita.** También se puede arrastrar
  la prenda hasta la muñeca.
- Un lugar, una prenda: el vestido quita la blusa y la falda, y la blusa o la falda quitan
  el vestido. Los accesorios van en su propio lugar (espalda, mano izquierda, mano derecha,
  lentes, cuello).
- **Dado mágico:** viste a la muñeca con un conjunto sorpresa.
- **Gancho:** quita toda la ropa de un jalón.
- **Cosquillas:** al tocar a la muñeca se ríe y se mueve.
- Cada prenda nueva hace un brinquito, brillitos y un sonido, y la muñeca dice qué se puso.
- La ropa puesta se guarda sola en el iPad (`localStorage`).

### Estilo
- **Caricatura dibujada en el código** (SVG): contornos suaves, colores pastel, cabeza grande.
- Muñecas originales. No se usa el nombre, el logo ni el estilo de Barbie ni de otra marca.
- Funciona con el iPad vertical u horizontal: el ropero se acomoda a un lado o abajo.

## Decisiones técnicas

- **HTML + JavaScript (módulos ES) + SVG**, sin paso de compilación: lo que está en `main` es lo que se publica.
- La muñeca vive en un lienzo de 300 × 600 y se arma por capas (`js/muneca.js`).
  Cada prenda (`js/ropa.js`) se dibuja en ese mismo lienzo y dice en qué capa va.
  Las blusas y los vestidos traen aparte sus mangas, que van encima de los brazos.
- Las miniaturas del ropero son la misma prenda, recortada con `getBBox()`.
- El color de piel y de pelo son variables de CSS (`--piel`, `--pelo`) para poder cambiarlos en la fase 3.
- Sonidos generados con Web Audio, sin archivos de audio. iOS no suena hasta el primer toque:
  el ▶ de la pantalla de inicio desbloquea el audio y la voz.
- `?depurar` al final de la dirección deja `window.__juego` para revisar el estado.
- **GitHub Pages** se publica desde la raíz de la rama `main`. `.nojekyll` evita que Jekyll procese los archivos.

## Fases

1. **Vestidor:** una muñeca, seis cajones de ropa, tocar o arrastrar, dado mágico, gancho,
   cosquillas, voz y sonidos. *Hecha el 2026-11-17; falta probarla en el iPad.*
2. **Pasarela y fotos:** la muñeca desfila con música y confeti; la foto se guarda en un álbum.
3. **Crear muñecas:** tono de piel, peinado, color de pelo y de ojos; varias muñecas guardadas.
4. **Peinados, pintura de cara y pintar la ropa.**
5. **Escenarios con preguntas sencillas:** "¡Vamos a la nieve! ¿Qué se pone?".
6. **Mascota, minijuegos e instalable:** PWA sin internet, ícono propio y música.

## Preguntas abiertas

### Pendiente de probar en el iPad (fase 1)

Abrir https://vdelrazo.github.io/casa-de-sarah/ y revisar:

1. ¿Se oyen los sonidos y la voz? ¿La voz suena con acento mexicano?
2. ¿Tocar una prenda se la pone y tocarla otra vez se la quita?
3. ¿Arrastrar una prenda hasta la muñeca funciona con el dedo?
4. ¿Se ve bien el iPad acostado y parado?
5. ¿Al cerrar y volver a abrir, la muñeca sigue con la misma ropa?
6. ¿Las niñas entienden solas los íconos de los cajones, el dado y el gancho?
