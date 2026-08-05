import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators'; // 1. IMPORTAR finalize
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
          // Se ejecuta SIEMPRE que termine la petición (éxito o error)
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
      this.error = ERROR_MESSAGES.REQUIRED_FIELDS;
      this.clearErrorAfterDelay();
      return false;
    }

    if (!this.isValidEmail(this.usuario.correo)) {
      this.error = ERROR_MESSAGES.INVALID_EMAIL;
      this.clearErrorAfterDelay();
      return false;
    }

    return true;
  }

  private handleLoginSuccess(response: LoginResponse): void {
    const rol = response?.data?.nombreRol;

    if (rol) {
      this.showSuccess = true;
      this.successMessage = SUCCESS_MESSAGES.LOGIN_SUCCESS;
      this.error = '';

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
    this.showSuccess = false;

    const serverMessage = err.error?.message;

    switch (err.status) {
      case 400:
        this.error = serverMessage || 'Credenciales incorrectas o usuario inactivo';
        break;
      case HttpStatus.UNAUTHORIZED:
        this.error = serverMessage || ERROR_MESSAGES.UNAUTHORIZED;
        break;
      case HttpStatus.NOT_FOUND:
        this.error = serverMessage || ERROR_MESSAGES.USER_NOT_FOUND;
        break;
      case HttpStatus.INTERNAL_SERVER_ERROR:
        this.error = ERROR_MESSAGES.SERVER_ERROR;
        break;
      case HttpStatus.CONNECTION_ERROR:
        this.error = ERROR_MESSAGES.CONNECTION_ERROR;
        break;
      default:
        this.error = serverMessage || ERROR_MESSAGES.GENERIC_ERROR;
        break;
    }

    console.log('Error manejado. Mensaje asignado:', this.error);
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
      this.cdr.detectChanges();
    }, this.config.errorClearDelay);
  }

  private clearStates(): void {
    this.error = '';
    this.showSuccess = false;
    this.successMessage = '';
  }
}