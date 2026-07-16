import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  constructor(private http: HttpClient) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.cargarSesion();
  }
login(credentials: any): Observable<any> {
  return this.http
    .post(`${this.apiUrl}/login`, credentials)
    .pipe(
      tap((response: any) => {
        const userData = response?.data;

        if (userData && userData.nombreRol) {
          this.guardarSesion(userData);
        }
      })
    );
}
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('user');
      localStorage.removeItem('rol');
      localStorage.removeItem('idUsuario');
      localStorage.removeItem('token');
    }
    this.userSubject.next(null);
  }
  private guardarSesion(userData: any): void {
    if (this.isBrowser) {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('rol', userData.nombreRol);
      localStorage.setItem('idUsuario', userData.idUsuario.toString());
      if (userData.tokenSesion) {
        localStorage.setItem('token', userData.tokenSesion);
      }
    }
    this.userSubject.next(userData);
  }
  private cargarSesion(): void {
    if (this.isBrowser) {
      const user = localStorage.getItem('user');
      if (user) {
        this.userSubject.next(JSON.parse(user));
      }
    }
  }
  getRol(): string | null {
    return this.isBrowser ? localStorage.getItem('rol') : null;
  }
  getIdUsuario(): number | null {
    if (!this.isBrowser) return null;
    const id = localStorage.getItem('idUsuario');
    return id ? parseInt(id) : null;
  }
  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('token') : null;
  }
  getUser(): any {
    if (!this.isBrowser) return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // 🔹 OBTENER NOMBRE COMPLETO
  getUserName(): string {
    const user = this.getUser();
    if (user) {
      const apellidoMaterno = user.apellidoMaterno ? ` ${user.apellidoMaterno}` : '';
      return `${user.nombre} ${user.apellidoPaterno}${apellidoMaterno}`;
    }
    return '';
  }
  isAuthenticated(): boolean {
    if (!this.isBrowser) return false;
    return !!localStorage.getItem('user') && !!localStorage.getItem('rol');
  }
  hasRole(role: string): boolean {
    const userRol = this.getRol();
    return userRol?.toLowerCase() === role.toLowerCase();
  }
  hasAnyRole(roles: string[]): boolean {
    const userRol = this.getRol();
    if (!userRol) return false;
    return roles.some(rol => rol.toLowerCase() === userRol.toLowerCase());
  }
  getMenuItems(): any[] {
    const rol = this.getRol()?.toLowerCase();
    
    const menus: { [key: string]: any[] } = {
      'administrador': [
        { icon: 'dashboard', label: 'Dashboard', route: '/admin/dashboard' },
        { icon: 'people', label: 'Usuarios', route: '/admin/usuarios' },
        { icon: 'medical_services', label: 'Recetas', route: '/admin/recetas' },
        { icon: 'medication', label: 'Medicamentos', route: '/admin/medicamentos' },
        { icon: 'shopping_cart', label: 'Carrito', route: '/admin/carrito' },
        { icon: 'receipt', label: 'Compras', route: '/admin/compras' },
        { icon: 'groups', label: 'Clientes', route: '/admin/clientes' },
        { icon: 'badge', label: 'Empleados', route: '/admin/empleados' },
        { icon: 'admin_panel_settings', label: 'Roles', route: '/admin/roles' },
        { icon: 'point_of_sale', label: 'Ventas', route: '/admin/ventas' }
      ],
      'medico': [
        { icon: 'dashboard', label: 'Dashboard', route: '/medico/dashboard' },
        { icon: 'medical_services', label: 'Recetas', route: '/medico/recetas' },
        { icon: 'groups', label: 'Pacientes', route: '/medico/pacientes' }
      ],
      'paciente': [
        { icon: 'home', label: 'Inicio', route: '/cliente/inicio' },
        { icon: 'shopping_cart', label: 'Carrito', route: '/cliente/carrito' },
        { icon: 'receipt', label: 'Mis Compras', route: '/cliente/compras' },
        { icon: 'medical_services', label: 'Mis Recetas', route: '/cliente/recetas' }
      ]
    };

    return menus[rol || ''] || [];
  }
}