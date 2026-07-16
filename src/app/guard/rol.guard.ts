import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RolGuard implements CanActivate {
  private platformId = inject(PLATFORM_ID);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return true; 
    }

    const rolesPermitidos = route.data['roles'] as Array<string>;
    const rolUsuario = this.authService.getRol();

    if (!rolUsuario) {
      this.router.navigate(['/login']);
      return false;
    }
    if (this.authService.hasAnyRole(rolesPermitidos)) {
      return true;
    }
    this.redirigirPorRol(rolUsuario);
    return false;
  }

  private redirigirPorRol(rol: string): void {
    const rutasPorRol: { [key: string]: string } = {
      'administrador': '/admin/dashboard',
      'medico': '/medico/expediente-clinico',
      'cliente': '/cliente/carrito'
    };
    const ruta = rutasPorRol[rol.toLowerCase()] || '/inicio';
    this.router.navigate([ruta]);
  }
}