import { Routes } from '@angular/router';
import { Login } from './auth/login/login'; 
import { Roles } from './roles/roles'; 
import { AdminLayoutLayout } from './shared/admin-layout/admin-layout.layout';

export const routes: Routes = [
  { path: '', redirectTo: 'admin/roles', pathMatch: 'full' },
  
  { path: 'login', component: Login },

  {
    path: 'admin',
    component: AdminLayoutLayout,
    children: [
      { path: 'roles', component: Roles },
      { path: 'inicio', component: Roles },
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

  { path: '**', redirectTo: 'admin/roles' }
];