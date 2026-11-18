# Casa de Sarah 👗

Un juego de vestir muñecas, en caricatura, hecho para niñas de 4 a 6 años.

**Jugar:** https://vdelrazo.github.io/casa-de-sarah/

## Instalar en el iPad

1. Abre el enlace en **Safari**.
2. Toca **Compartir** (el cuadro con la flecha hacia arriba).
3. Elige **Agregar a pantalla de inicio**.

El juego queda con su propio ícono y se abre en pantalla completa.

## Cómo se juega

- Toca un cajón del ropero (blusas, faldas, vestidos, zapatos, cabeza, accesorios).
- Toca una prenda para ponérsela; tócala otra vez para quitársela. También se puede arrastrar hasta la muñeca.
- 🎲 viste a la muñeca con ropa sorpresa; el gancho le quita toda la ropa.
- Si tocas a la muñeca, le haces cosquillas.

## Probar en la computadora

```
python -m http.server 8000
```

y abrir http://localhost:8000. El sonido y la voz se oyen mejor en el iPad.

Agregando `?depurar` a la dirección queda `window.__juego` en la consola para revisar el estado.

Las reglas y las decisiones de diseño están en [CLAUDE.md](CLAUDE.md).
