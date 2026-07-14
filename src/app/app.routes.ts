import { Routes } from '@angular/router';
import { RecetaComponent } from './receta/receta';
import { DetalleRecetaComponent } from './detalleReceta/detalleReceta';
import { Login } from './auth/login/login';
import { Roles } from './roles/roles';
import { Inicio } from './inicio/inicio';
import { AdminLayoutLayout } from './shared/admin-layout/admin-layout.layout';
import { ClienteLayout } from './shared/cliente-layout/cliente-layout';
import { Carrito } from './cliente/carrito/carrito';
import { Compras } from './cliente/compras/compras';
import { MedicamentosComponent } from './medicamentos/medicamentos';
import { ExpedienteClinicoComponent } from './expedienteClinico/expedienteClinico';



export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'inicio', component: Inicio },
  
  { path: 'recetas', component: RecetaComponent },
  { path: 'detalle-receta/:idReceta', component: DetalleRecetaComponent },
  { path: 'medicamentos', component: MedicamentosComponent },
  { path: 'expediente-clinico', component: ExpedienteClinicoComponent },


  {
    path: 'admin',
    component: AdminLayoutLayout,
    children: [
      { path: 'roles', component: Roles },
      { path: 'carrito', component: Roles },
      { path: 'compras', component: Roles },
      { path: 'productos', component: Roles },
      { path: 'medicamentos', component: Roles },
      { path: 'clientes', component: Roles },
      { path: 'empleados', component: Roles },
      { path: 'usuarios', component: Roles },
      { path: 'ventas', component: Roles }
    ]
  },

  {
    path: 'cliente',
    component: ClienteLayout,
    children: [
      {
        path: '',
        redirectTo: 'carrito',
        pathMatch: 'full'
      },
      {
        path: 'carrito',
        component: Carrito
      },
      {
        path: 'compras',
        component: Compras
      }
    ]
  },

  { path: '**', redirectTo: 'inicio' }
];