// Casa: el bebé sentado en su tapete. Si se le toca, le dan cosquillas.
// Aquí no hay herramientas: la burbuja dice qué quiere el bebé (eso lo maneja main.js).

export default {
  id: 'casa',
  herramientas: [],

  entrar(ctx) {
    ctx.bebe.base('abiertos', 'sonrisa');
  },

  alTocar(p, ctx) {
    if (ctx.bebe.contiene(ctx.aBebe(p))) ctx.cosquillas();
  },

  pista() {
    return null;
  },
};
