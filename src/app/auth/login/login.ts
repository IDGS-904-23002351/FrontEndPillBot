import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  usuario = { 
    correo: '', 
    contrasena: '',
    dispositivo: 'Web',
    ipOrigen: '127.0.0.1',
    detallesNavegador: 'Chrome'
  };
  cargando = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.cargando = true; 
    this.authService.login(this.usuario).subscribe({
      next: (res: any) => {
        this.cargando = false;
        localStorage.setItem('token', res.data.token);
        this.router.navigate(['/admin/roles']);
      },
      error: (err) => {
        this.cargando = false; 
        if (err.status === 401) {
          alert('Credenciales incorrectas');
        } else if (err.status === 400) {
          alert('Datos inválidos: ' + (err.error.message || 'Verifica los campos'));
        } else if (err.status === 0) {
          alert('Error de conexión: Verifica que el servidor esté activo y CORS permitido.');
        } else {
          alert('Error ' + err.status + ': ' + (err.error?.message || 'Contacta al soporte técnico'));
        }
      }
    });
  }
}