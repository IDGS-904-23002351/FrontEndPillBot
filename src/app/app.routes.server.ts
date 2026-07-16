import {
  RenderMode,
  ServerRoute
} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'admin/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'cliente/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'detalle-receta/:idReceta',
    renderMode: RenderMode.Server
  },
  {
    path: 'cliente/**',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
