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
  
  // Rutas protegidas con autenticación
  {
    path: 'inicio',
    component: Inicio,
    canActivate: [AuthGuard]
  },
  
  // 🔹 RUTAS DE ADMINISTRADOR
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
      { path: 'medicamentos', component: MedicamentosComponent }, // Actualizado con su componente real
      { path: 'clientes', component: Roles },
      { path: 'empleados', component: Roles },
      { path: 'usuarios', component: Roles },
      { path: 'ventas', component: Roles },
      { path: 'recetas', component: RecetaComponent },
      { path: 'detalle-receta/:idReceta', component: DetalleRecetaComponent },
      { path: 'expediente-clinico', component: ExpedienteClinicoComponent } // Añadido a admin
    ]
  },

  // 🔹 RUTAS DE CLIENTE
  {
    path: 'cliente',
    component: ClienteLayout,
    canActivate: [AuthGuard, RolGuard],
    data: { roles: ['paciente'] },
    children: [
      { path: '', redirectTo: 'carrito', pathMatch: 'full' },
      { path: 'carrito', component: Carrito },
      { path: 'compras', component: Compras },
      { path: 'recetas', component: RecetaComponent },
      { path: 'detalle-receta/:idReceta', component: DetalleRecetaComponent },
      { path: 'medicamentos', component: MedicamentosComponent }, // Añadido a cliente
      { path: 'expediente-clinico', component: ExpedienteClinicoComponent }, // Añadido a cliente
      { path: 'inicio', component: Inicio }
    ]
  },

  // 🔹 RUTAS DE MÉDICO
  {
    path: 'medico',
    component: AdminLayoutLayout,
    canActivate: [AuthGuard, RolGuard],
    data: { roles: ['medico'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Inicio },
      { path: 'recetas', component: RecetaComponent },
      { path: 'detalle-receta/:idReceta', component: DetalleRecetaComponent },
      { path: 'medicamentos', component: MedicamentosComponent }, // Añadido a médico
      { path: 'expediente-clinico', component: ExpedienteClinicoComponent }, // Añadido a médico
      { path: 'pacientes', component: Roles }
    ]
  },

  { path: '**', redirectTo: 'inicio' }
];