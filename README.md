# Casa de Sarah 🍼

Un juego de cuidar a un bebé, en caricatura, hecho para niñas de 4 a 6 años.

**Jugar:** https://vdelrazo.github.io/casa-de-sarah/

## Instalar en el iPad

1. Abre el enlace en **Safari**.
2. Toca **Compartir** (el cuadro con la flecha hacia arriba).
3. Elige **Agregar a pantalla de inicio**.

El juego queda con su propio ícono y se abre en pantalla completa.

## Cómo se juega

- Abajo están la casa, comer 🍼, bañar 🦆 y dormir 🌙. El botón que late es lo que el bebé quiere;
  también lo dice su burbuja (tocarla lleva directo ahí).
- Las herramientas se **arrastran con el dedo** hasta el bebé. La que toca usar brilla y, si no
  se hace nada, una manita enseña el movimiento.
- **Comer:** cuchara del plato a la boca, luego el biberón, y palmaditas hasta que eructe.
  La servilleta limpia la cara.
- **Bañar:** jabón para quitar el lodo, regadera para quitar la espuma y toalla para secarlo.
- **Dormir:** mecer la cuna (arrastrando de lado a lado o tocándola), el chupón ayuda,
  y ya dormido se apaga la lámpara. El sol lo despierta.
- Cada cuidado terminado da una ⭐.

## Probar en la computadora

```
python -m http.server 8000
```

y abrir http://localhost:8000. Los sonidos se oyen mejor en el iPad.

Agregando `?depurar` a la dirección queda `window.__juego` en la consola para revisar el estado.

Las reglas y las decisiones de diseño están en [CLAUDE.md](CLAUDE.md).
