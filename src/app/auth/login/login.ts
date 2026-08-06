import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators'; 
import { AuthService } from '../../services/auth.service';
import {
  LoginCredentials,
  LoginResponse,
  UsuarioLogin,
  HttpStatus,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  RUTAS_POR_ROL,
  DEFAULT_LOGIN_CONFIG
} from '../../models/login.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  passwordVisible = false;
  rememberMe = false;
  usuario: UsuarioLogin = {
    correo: '',
    contrasena: ''
  };

  error: string = '';
  loading: boolean = false;
  showSuccess: boolean = false;
  successMessage: string = '';

  private readonly config = DEFAULT_LOGIN_CONFIG;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  onLogin(): void {
    this.clearStates();

    if (!this.validateFields()) {
      return;
    }
    
    this.loading = true;

    const credentials: LoginCredentials = {
      correo: this.usuario.correo,
      contrasena: this.usuario.contrasena,
      dispositivo: this.config.deviceInfo.dispositivo,
      ipOrigen: this.config.deviceInfo.ipOrigen,
      detallesNavegador: this.config.deviceInfo.detallesNavegador
    };

    this.authService.login(credentials)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response: LoginResponse) => this.handleLoginSuccess(response),
        error: (err) => this.handleLoginError(err)
      });
  }

  private validateFields(): boolean {
    if (!this.usuario.correo || !this.usuario.contrasena) {
      this.error = 'Por favor, ingresa tu correo y contraseña.';
      this.cdr.detectChanges();
      return false;
    }

    if (!this.isValidEmail(this.usuario.correo)) {
      this.error = 'Por favor, ingresa un correo electrónico válido.';
      this.cdr.detectChanges();
      return false;
    }

    return true;
  }

  private handleLoginSuccess(response: LoginResponse): void {
    const rol = response?.data?.nombreRol;

    if (rol) {
      this.showSuccess = true;
      this.successMessage = '¡Bienvenido! Inicio de sesión exitoso.';
      this.error = '';
      this.cdr.detectChanges();

      setTimeout(() => {
        this.redirigirPorRol(rol);
      }, this.config.redirectDelay);
    } else {
      this.error = 'No se pudo determinar el rol del usuario.';
      this.cdr.detectChanges();
      
      setTimeout(() => {
        this.router.navigate(['/inicio']);
      }, this.config.redirectDelay + 500);
    }
  }

  private handleLoginError(err: any): void {
    this.showSuccess = false;
    this.cdr.detectChanges();

    const serverMessage = err.error?.message;

    switch (err.status) {
      case 400:
        this.error = serverMessage || 'Credenciales incorrectas o usuario inactivo.';
        break;
      case HttpStatus.UNAUTHORIZED:
        this.error = serverMessage || 'Usuario o contraseña incorrectos.';
        break;
      case HttpStatus.NOT_FOUND:
        this.error = serverMessage || 'Usuario no encontrado.';
        break;
      case HttpStatus.INTERNAL_SERVER_ERROR:
        this.error = 'Error en el servidor. Por favor, intenta más tarde.';
        break;
      case HttpStatus.CONNECTION_ERROR:
        this.error = 'Error de conexión. Verifica tu internet.';
        break;
      default:
        this.error = serverMessage || 'Ocurrió un error al iniciar sesión.';
        break;
    }

    this.cdr.detectChanges();
    console.log('Error:', this.error);
  }

  private redirigirPorRol(rol: string): void {
    const rolKey = rol.toLowerCase();
    const ruta = RUTAS_POR_ROL[rolKey] || '/inicio';
    this.router.navigate([ruta]);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private clearStates(): void {
    this.error = '';
    this.showSuccess = false;
    this.successMessage = '';
    this.cdr.detectChanges();
  }
}