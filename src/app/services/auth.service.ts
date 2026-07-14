// services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    // Recuperar sesión al iniciar la app
    this.cargarSesion();
  }

  // 🔹 INICIAR SESIÓN
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/loginWeb`, credentials)
      .pipe(
        tap((response: any) => {
          if (response && response.nombreRol) {
            this.guardarSesion(response);
          }
          return response;
        })
      );
  }

  // 🔹 CERRAR SESIÓN
  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('rol');
    localStorage.removeItem('idUsuario');
    localStorage.removeItem('token');
    this.userSubject.next(null);
  }

  // 🔹 GUARDAR SESIÓN
  private guardarSesion(userData: any): void {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('rol', userData.nombreRol);
    localStorage.setItem('idUsuario', userData.idUsuario.toString());
    if (userData.tokenSesion) {
      localStorage.setItem('token', userData.tokenSesion);
    }
    this.userSubject.next(userData);
  }

  // 🔹 CARGAR SESIÓN GUARDADA
  private cargarSesion(): void {
    const user = localStorage.getItem('user');
    if (user) {
      this.userSubject.next(JSON.parse(user));
    }
  }

  // 🔹 OBTENER ROL DEL USUARIO
  getRol(): string | null {
    return localStorage.getItem('rol');
  }

  // 🔹 OBTENER ID DEL USUARIO
  getIdUsuario(): number | null {
    const id = localStorage.getItem('idUsuario');
    return id ? parseInt(id) : null;
  }

  // 🔹 OBTENER TOKEN
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // 🔹 OBTENER DATOS COMPLETOS DEL USUARIO
  getUser(): any {
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

  // 🔹 VERIFICAR SI ESTÁ AUTENTICADO
  isAuthenticated(): boolean {
    return !!localStorage.getItem('user') && !!localStorage.getItem('rol');
  }

  // 🔹 VERIFICAR SI TIENE UN ROL ESPECÍFICO
  hasRole(role: string): boolean {
    const userRol = this.getRol();
    return userRol?.toLowerCase() === role.toLowerCase();
  }

  // 🔹 VERIFICAR SI TIENE ALGUNO DE LOS ROLES
  hasAnyRole(roles: string[]): boolean {
    const userRol = this.getRol();
    if (!userRol) return false;
    return roles.some(rol => rol.toLowerCase() === userRol.toLowerCase());
  }

  // 🔹 OBTENER MENÚ SEGÚN ROL
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