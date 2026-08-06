import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ApiResponse, Roles, UsuarioRegistroDto } from '../../app/models/registrar.model';

@Component({
  selector: 'app-registro-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro-usuario.html',
  styleUrls: ['./registro-usuario.css']
})
export class RegistroUsuarioComponent implements OnInit {
  usuario: UsuarioRegistroDto = {
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    fechaNacimiento: '',
    telefono: '',
    correo: '',
    direccion: '',
    idRol: 3,
    contrasenaHash: ''
  };

  roles: Roles[] = [];
  cargandoRoles: boolean = false;
  errorRoles: string = '';

  cargando: boolean = false;
  enviado: boolean = false;
  errorFormulario: string = '';
  successMessage: string = '';

  mostrarContrasena: boolean = false;
  mostrarConfirmacion: boolean = false;
  contrasenaConfirmacion: string = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.cargandoRoles = true;
    this.errorRoles = '';
    
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${environment.apiUrl}/api/rol/roles`;
    console.log('📡 Obteniendo roles desde:', url);

    this.http.get<ApiResponse<Roles[]>>(url, { headers })
      .subscribe({
        next: (res) => {
          console.log('✅ Respuesta de roles:', res);
          this.cargandoRoles = false;
          
          if (res.success && res.data && res.data.length > 0) {
            this.roles = res.data;
            console.log('📋 Roles cargados:', this.roles.length);
            
            // Seleccionar el primer rol por defecto
            this.usuario.idRol = this.roles[0].idRol;
          } else {
            this.errorRoles = 'No se pudieron cargar los roles';
          }
        },
        error: (err) => {
          console.error('❌ Error al cargar roles:', err);
          this.cargandoRoles = false;
          this.errorRoles = err.error?.message || 'Error al cargar los roles';
        }
      });
  }

  validarFormulario(): boolean {
    this.errorFormulario = '';

    if (!this.usuario.nombre.trim()) {
      this.errorFormulario = 'El nombre es obligatorio';
      return false;
    }

    if (!this.usuario.apellidoPaterno.trim()) {
      this.errorFormulario = 'El apellido paterno es obligatorio';
      return false;
    }

    if (!this.usuario.correo.trim()) {
      this.errorFormulario = 'El correo electrónico es obligatorio';
      return false;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.usuario.correo)) {
      this.errorFormulario = 'Ingresa un correo electrónico válido';
      return false;
    }

    if (!this.usuario.contrasenaHash || this.usuario.contrasenaHash.length < 6) {
      this.errorFormulario = 'La contraseña debe tener al menos 6 caracteres';
      return false;
    }

    if (this.usuario.contrasenaHash !== this.contrasenaConfirmacion) {
      this.errorFormulario = 'Las contraseñas no coinciden';
      return false;
    }

    return true;
  }

  registrar(): void {
    this.enviado = true;
    this.errorFormulario = '';
    this.successMessage = '';

    if (!this.validarFormulario()) {
      return;
    }

    this.cargando = true;

    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const datosRegistro = {
      nombre: this.usuario.nombre.trim(),
      apellidoPaterno: this.usuario.apellidoPaterno.trim(),
      apellidoMaterno: this.usuario.apellidoMaterno?.trim() || null,
      fechaNacimiento: this.usuario.fechaNacimiento || null,
      telefono: this.usuario.telefono?.trim() || null,
      correo: this.usuario.correo.trim(),
      direccion: this.usuario.direccion?.trim() || null,
      idRol: this.usuario.idRol,
      contrasenaHash: this.usuario.contrasenaHash
    };

    console.log('📝 Registrando usuario:', datosRegistro);

    this.http.post<ApiResponse<any>>(
      `${environment.apiUrl}/api/admin/usuarios/agregarUsuario`,
      datosRegistro,
      { headers }
    ).subscribe({
      next: (res) => {
        console.log('✅ Respuesta registro:', res);
        this.cargando = false;
        if (res.success) {
          this.successMessage = 'Usuario registrado exitosamente. Redirigiendo al login...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.errorFormulario = res.message || 'Error al registrar usuario';
        }
      },
      error: (err) => {
        console.error('❌ Error al registrar:', err);
        this.cargando = false;
        this.errorFormulario = err.error?.message || 'Error de conexión con el servidor';
      }
    });
  }

  toggleMostrarContrasena(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  toggleMostrarConfirmacion(): void {
    this.mostrarConfirmacion = !this.mostrarConfirmacion;
  }

  irALogin(): void {
    this.router.navigate(['/login']);
  }
}