import { Routes } from '@angular/router';
import { RecetaComponent } from './receta/receta';
import { DetalleRecetaComponent } from './detalleReceta/detalleReceta';

export const routes: Routes = [
  { path: '', redirectTo: 'recetas', pathMatch: 'full' },
  { path: 'recetas', component: RecetaComponent },
  { path: 'detalle-receta/:idReceta', component: DetalleRecetaComponent },
  { path: '**', redirectTo: 'recetas' }
];