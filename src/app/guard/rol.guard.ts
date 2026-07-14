import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RolGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const rolesPermitidos = route.data['roles'] as Array<string>;
    const rolUsuario = this.authService.getRol();

    if (!rolUsuario) {
      this.router.navigate(['/login']);
      return false;
    }

    // Verificar si el usuario tiene el rol permitido
    if (this.authService.hasAnyRole(rolesPermitidos)) {
      return true;
    }

    // Redirigir según el rol que tiene
    this.redirigirPorRol(rolUsuario);
    return false;
  }

  private redirigirPorRol(rol: string): void {
    const rutasPorRol: { [key: string]: string } = {
      'administrador': '/admin/dashboard',
      'medico': '/medico/dashboard',
      'paciente': '/cliente/carrito'
    };

    const ruta = rutasPorRol[rol.toLowerCase()] || '/inicio';
    this.router.navigate([ruta]);
  }
}