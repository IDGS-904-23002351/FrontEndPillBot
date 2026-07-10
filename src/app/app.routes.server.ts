import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // /detalle-receta/123 depende de un idReceta dinámico y de datos que solo
    // existen en tiempo de ejecución (llamadas HTTP al backend). No se puede
    // "adivinar" en build time, así que esta ruta NO debe prerenderizarse.
    path: 'detalle-receta/:idReceta',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];