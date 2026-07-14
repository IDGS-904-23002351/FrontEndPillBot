import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './roles.html',
  styleUrl: './roles.css',
})
export class Roles implements OnInit {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api/rol/roles`;
  
  // Propiedades
  roles: any[] = [];
  mostrarFormulario = false;
  nuevoRol = { nombreRol: '', descripcion: '' };

  constructor() {
    // Inicialización adicional si es necesaria
  }

  ngOnInit() {
    this.cargarRoles();
  }

  cargarRoles() {
    console.log('Cargando roles...');
    this.http.get<any>(this.url).subscribe({
      next: (res) => {
        console.log('Respuesta recibida:', res);
        if (res && res.success) {
          this.roles = res.data || [];
        } else if (Array.isArray(res)) {
          this.roles = res;
        } else if (res && res.data) {
          this.roles = res.data;
        } else {
          this.roles = [];
          console.warn('Formato de respuesta no reconocido:', res);
        }
        console.log('Roles cargados:', this.roles);
      },
      error: (err) => {
        console.error('Error al cargar roles:', err);
        this.roles = [];
      }
    });
  }

  agregarRol() {
    if (!this.nuevoRol.nombreRol) {
      alert('El nombre del rol es obligatorio');
      return;
    }
    
    console.log('Creando rol:', this.nuevoRol);
    this.http.post(`${environment.apiUrl}/api/rol/crearRoles`, this.nuevoRol).subscribe({
      next: (res) => {
        console.log('Rol creado:', res);
        this.nuevoRol = { nombreRol: '', descripcion: '' };
        this.mostrarFormulario = false;
        this.cargarRoles();
      },
      error: (err) => {
        console.error('Error al crear rol:', err);
        alert('Error al crear rol: ' + (err.error?.message || err.message));
      }
    });
  }

  eliminarRol(id: number) {
    if (confirm('¿Desactivar este rol?')) {
      console.log('Eliminando rol ID:', id);
      this.http.put(`${environment.apiUrl}/api/rol/desactivar/${id}`, {}).subscribe({
        next: (res) => {
          console.log('Rol desactivado:', res);
          this.cargarRoles();
        },
        error: (err) => {
          console.error('Error al desactivar rol:', err);
          alert('Error al desactivar: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  // Método opcional para debugging
  testConexion() {
    this.http.get(`${environment.apiUrl}/api/rol/test`).subscribe({
      next: (res) => console.log('Conexión exitosa:', res),
      error: (err) => console.error('Error de conexión:', err)
    });
  }
}