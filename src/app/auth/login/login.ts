import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  LoginCredentials,
  LoginResponse,
  UsuarioLogin,
  ErrorMessage,
  Roles,
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
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
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
    private router: Router
  ) {}

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

    this.authService.login(credentials).subscribe({
      next: (response: LoginResponse) => this.handleLoginSuccess(response),
      error: (err) => this.handleLoginError(err)
    });
  }
  private validateFields(): boolean {
    // Validar campos vacíos
    if (!this.usuario.correo || !this.usuario.contrasena) {
      this.error = ERROR_MESSAGES.REQUIRED_FIELDS;
      this.clearErrorAfterDelay();
      return false;
    }

    // Validar formato de email
    if (!this.isValidEmail(this.usuario.correo)) {
      this.error = ERROR_MESSAGES.INVALID_EMAIL;
      this.clearErrorAfterDelay();
      return false;
    }

    return true;
  }
  private handleLoginSuccess(response: LoginResponse): void {
    this.loading = false;
    const rol = response?.data?.nombreRol;

    if (rol) {
      this.showSuccess = true;
      this.successMessage = SUCCESS_MESSAGES.LOGIN_SUCCESS;
      this.error = '';

      // Redirigir después del delay configurado
      setTimeout(() => {
        this.redirigirPorRol(rol);
      }, this.config.redirectDelay);
    } else {
      this.error = ERROR_MESSAGES.ROLE_NOT_DETERMINED;
      this.clearErrorAfterDelay();
      
      setTimeout(() => {
        this.router.navigate(['/inicio']);
      }, this.config.redirectDelay + 500);
    }
  }
  private handleLoginError(err: any): void {
    this.loading = false;
    this.showSuccess = false;
    switch (err.status) {
      case HttpStatus.UNAUTHORIZED:
        this.error = ERROR_MESSAGES.UNAUTHORIZED;
        break;
      case HttpStatus.NOT_FOUND:
        this.error = ERROR_MESSAGES.USER_NOT_FOUND;
        break;
      case HttpStatus.INTERNAL_SERVER_ERROR:
        this.error = ERROR_MESSAGES.SERVER_ERROR;
        break;
      case HttpStatus.CONNECTION_ERROR:
        this.error = ERROR_MESSAGES.CONNECTION_ERROR;
        break;
      default:
        this.error = err.error?.message || ERROR_MESSAGES.GENERIC_ERROR;
        break;
    }

    console.error('Error en login:', err);
    this.clearErrorAfterDelay();
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
  private clearErrorAfterDelay(): void {
    setTimeout(() => {
      this.error = '';
    }, this.config.errorClearDelay);
  }
  private clearStates(): void {
    this.error = '';
    this.showSuccess = false;
    this.successMessage = '';
  }
}