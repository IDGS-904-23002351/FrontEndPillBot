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
import { AuthGuard } from './guard/auth.guard';
import { RolGuard } from './guard/rol.guard';
import { MedicamentosComponent } from './medicamentos/medicamentos';
import { ExpedienteClinicoComponent } from './expedienteClinico/expedienteClinico';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'inicio', component: Inicio, canActivate: [AuthGuard] },
  { path: 'recetas', component: RecetaComponent, canActivate: [AuthGuard] },
  { path: 'detalle-receta/:idReceta', component: DetalleRecetaComponent, canActivate: [AuthGuard] },

  {
    path: 'admin',
    component: AdminLayoutLayout,
    canActivate: [AuthGuard, RolGuard],
    data: { roles: ['administrador'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Inicio },
      { path: 'roles', component: Roles },
      { path: 'carrito', component: Carrito },
      { path: 'compras', component: Compras },
      { path: 'productos', component: Roles },
      { path: 'medicamentos', component: MedicamentosComponent },
      { path: 'clientes', component: Roles },
      { path: 'empleados', component: Roles },
      { path: 'usuarios', component: Roles },
      { path: 'ventas', component: Roles },
      { path: 'expediente-clinico', component: ExpedienteClinicoComponent }
    ]
  },
  {
    path: 'cliente',
    component: ClienteLayout,
    canActivate: [AuthGuard, RolGuard],
    data: { roles: ['paciente'] },
    children: [
      { path: '', redirectTo: 'carrito', pathMatch: 'full' },
      { path: 'carrito', component: Carrito },
      { path: 'compras', component: Compras },
      { path: 'medicamentos', component: MedicamentosComponent },
      { path: 'expediente-clinico', component: ExpedienteClinicoComponent }
    ]
  },
  {
    path: 'medico',
    component: AdminLayoutLayout,
    canActivate: [AuthGuard, RolGuard],
    data: { roles: ['medico'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Inicio },
      { path: 'medicamentos', component: MedicamentosComponent },
      { path: 'expediente-clinico', component: ExpedienteClinicoComponent },
      { path: 'pacientes', component: Roles }
    ]
  },

  { path: '**', redirectTo: 'inicio' }
];