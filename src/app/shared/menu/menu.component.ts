import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.component.html',
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .sidebar {
      width: 260px;
      height: 100vh;
      background-color: #00015c; 
      color: #ffffff;
      display: flex;
      flex-direction: column;
      padding: 35px 25px;
      box-sizing: border-box;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .sidebar-header {
      text-align: center;
      margin-bottom: 5px;
    }

    .sidebar-header h1 {
      margin: 0;
      font-size: 1.7rem;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 0.5px;
    }

    .separator {
      border: none;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      margin: 20px 0;
      width: 100%;
    }

    .menu {
      flex: 1;
      overflow: hidden; 
    }

    .menu ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .menu li {
      margin-bottom: 12px;
    }

    .menu a {
      display: block;
      color: #ffffff;
      text-decoration: none;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 1.1rem;
      transition: background-color 0.2s ease;
    }

    /* Hover */
    .menu a:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }

    .menu a.active {
      background-color: #2d5f8f; /* El azul acero exacto de la selección en el cliente */
      color: #ffffff;
      font-weight: 500;
    }

    /* Botón de cerrar sesión plano */
    .logout-link {
      background: none;
      border: none;
      color: #ffffff;
      font-size: 1.1rem;
      padding: 12px 16px;
      text-align: left;
      width: 100%;
      cursor: pointer;
      font-family: inherit;
      border-radius: 8px;
      transition: background-color 0.2s ease;
    }

    .logout-link:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }

  `]
})
export class MenuComponent implements OnInit {
  menuItems: any[] = [];
  userName: string = '';
  userRol: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userName = this.authService.getUserName();

    const rawRol = this.authService.getRol() || 'Cliente';
    this.userRol = rawRol.charAt(0).toUpperCase() + rawRol.slice(1).toLowerCase();

    this.menuItems = this.authService.getMenuItems();

    if (!this.menuItems || this.menuItems.length === 0) {
      const rol = this.userRol.toLowerCase();

      if (rol === 'administrador') {
        this.menuItems = [
          { label: 'Dashboard', route: '/dashboard' },
          { label: 'Usuarios', route: '/usuarios' },
          { label: 'Recetas', route: '/recetas' },
          { label: 'Medicamentos', route: '/medicamentos' },
          { icon: 'inventory', label: 'Inventario', route: '/admin/productos' },
          { icon: 'point_of_sale', label: 'Ventas', route: '/admin/ventas' },
          { icon: 'analytics', label: 'Dashboard Ventas', route: '/admin/dashboard-ventas' }

          // { label: 'Carrito', route: '/carrito' },
          // { label: 'Compras', route: '/compras' }

        ];
      } else if (rol === 'medico') {
        this.menuItems = [
          { label: 'Pacientes', route: '/medico/expediente-clinico' },
          { label: 'Medicamentos', route: '/medico/medicamentos' },
          { label: 'Recetas', route: '/medico/recetas' }
        ];
      } else {
        this.menuItems = [
          { label: 'Inicio', route: '/cliente/inicio' },
          { label: 'Carrito', route: '/cliente/carrito' },
          { label: 'Compras', route: '/cliente/compras' }
        ];
      }
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
