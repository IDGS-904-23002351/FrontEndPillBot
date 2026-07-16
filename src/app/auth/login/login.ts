// auth/login/login.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  usuario = {
    correo: '',
    contrasena: ''
  };
  error: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin() {
    if (!this.usuario.correo || !this.usuario.contrasena) {
      this.error = 'Por favor complete todos los campos';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login({
      correo: this.usuario.correo,
      contrasena: this.usuario.contrasena,
      dispositivo: 'Navegador',
      ipOrigen: '127.0.0.1',
      detallesNavegador: 'Angular Web'
    }).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.redirigirPorRol(response.nombreRol);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Credenciales incorrectas';
        console.error('Error en login:', err);
      }
    });
  }

  private redirigirPorRol(rol: string) {
    const rutasPorRol: { [key: string]: string } = {
      'administrador': '/admin/dashboard',
      'medico': '/medico/expediente-clinico',
      'cliente': '/cliente/carrito'
    };

    const ruta = rutasPorRol[rol.toLowerCase()] || '/inicio';
    this.router.navigate([ruta]);
  }
}