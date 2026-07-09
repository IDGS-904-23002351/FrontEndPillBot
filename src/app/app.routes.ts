import { Routes } from '@angular/router';
import { Login } from './auth/login/login'; 
import { Roles } from './roles/roles'; 

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  { path: 'login', component: Login },
  { path: 'roles', component: Roles } 
];