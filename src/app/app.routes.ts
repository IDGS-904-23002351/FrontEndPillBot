import { Routes } from '@angular/router';
import { RecetaComponent } from './models/receta.models';
import { DetalleRecetaComponent } from './models/detalleReceta.models';
import { LoginComponent } from './auth/login/login';
import { Roles } from './roles/roles';
import { UsuarioComponent } from './usuario/usuario';
import { Productos } from './productos/productos';
import { Inicio } from './inicio/inicio';
import { AdminLayoutLayout } from './shared/admin-layout/admin-layout.layout';
import { ClienteLayout } from './shared/cliente-layout/cliente-layout';
import { Carrito } from './cliente/carrito/carrito';
import { Compras } from './cliente/compras/compras';
import { CategoriasComponent } from './models/categorias.models';

import { AuthGuard } from './guard/auth.guard';
import { RolGuard } from './guard/rol.guard';
import { MedicamentosComponent } from './models/medicamentos.models';
import { ExpedienteClinicoComponent } from './models/expedienteClinico.models';
import { MedicoLayout } from './shared/medico-layout/medico-layout'; // ← corregido

import { Ventas } from './ventas/ventas';
import { InventarioProductos } from './inventario-productos/inventario-productos';
import { DashboardVentas } from './dashboard-ventas/dashboard-ventas';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'productos', component: Productos },
  { path: 'inicio', component: Inicio, canActivate: [AuthGuard] },
  { path: 'recetas', component: RecetaComponent, canActivate: [AuthGuard] },
  {
    path: 'detalle-receta/:idReceta',
    component: DetalleRecetaComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'admin',
    component: AdminLayoutLayout,
    canActivate: [AuthGuard, RolGuard],
    data: { roles: ['administrador'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Inicio },
      { path: 'roles', component: Roles },
      { path: 'usuarios', component: UsuarioComponent},
      { path: 'expediente-clinico', component: ExpedienteClinicoComponent},
      // { path: 'carrito', component: Carrito },
      // { path: 'compras', component: Compras },
      { path: 'productos', component: InventarioProductos },
      { path: 'recetas', component: RecetaComponent },
      { path: 'detalle-receta/:idReceta', component: DetalleRecetaComponent},
      { path: 'categorias', component: CategoriasComponent },
      { path: 'medicamentos', component: MedicamentosComponent },
      //{ path: 'usuarios', component: Roles },
      { path: 'ventas', component: Ventas },
      { path: 'dashboard-ventas', component: DashboardVentas }
      
    
    ]
  },

  {
    path: 'cliente',
    component: ClienteLayout,
    canActivate: [AuthGuard, RolGuard],
    data: { roles: ['cliente'] },
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: Inicio },
      { path: 'carrito', component: Carrito },
      { path: 'compras', component: Compras },
      { path: 'recetas', component: RecetaComponent },
      { path: 'detalle-receta/:idReceta', component: DetalleRecetaComponent },
      { path: 'medicamentos', component: MedicamentosComponent },
      {path: 'expediente-clinico', component: ExpedienteClinicoComponent}
    ]
  },

  {
  path: 'medico',
  component: MedicoLayout,
  canActivate: [AuthGuard, RolGuard],
  data: { roles: ['medico'] },
  children: [
    {
      path: '',
      redirectTo: 'expediente-clinico',
      pathMatch: 'full'
    },
    {
      path: 'expediente-clinico',
      component: ExpedienteClinicoComponent
    },
    {
      path: 'medicamentos',
      component: MedicamentosComponent
    },
    {
      path: 'recetas',
      component: RecetaComponent
    },
    {
      path: 'detalle-receta/:idReceta',
      component: DetalleRecetaComponent
    },
    { path: 'categorias', 
      component: CategoriasComponent },
  ]
},

  { path: '**', redirectTo: 'inicio' }
];
