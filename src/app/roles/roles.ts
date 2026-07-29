import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Rol {
  idRol: number;
  nombreRol: string;
  descripcion: string;
  estatus: number; 
}
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

type ModoModal = 'ninguno' | 'ver' | 'crear' | 'editar' | 'eliminar';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.html',
  styleUrl: './roles.css'
})
export class Roles implements OnInit {
  private http = inject(HttpClient);
  private readonly apiRolesBase = `${environment.apiUrl}/api/rol`;
  private readonly urlObtenerTodos = `${this.apiRolesBase}/roles`;
  private readonly urlCrear = `${this.apiRolesBase}/crearRoles`;
  private readonly urlActualizar = `${this.apiRolesBase}/actualizarRol`;
  private readonly urlDesactivar = `${this.apiRolesBase}/desactivar`;

  roles = signal<Rol[]>([]);
  busqueda = signal('');
  cargando = signal(false);
  errorCarga = signal('');

  modal = signal<ModoModal>('ninguno');
  rolSeleccionado = signal<Rol | null>(null);
  rolForm: Partial<Rol> = {
  nombreRol: '',
  descripcion: '',
  estatus: 1 
};
  guardando = signal(false);
  errorFormulario = signal('');
  rolesFiltrados = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    const lista = this.roles();
    if (!termino) return lista;
    return lista.filter(r =>
      (r.nombreRol ?? '').toLowerCase().includes(termino) ||
      (r.descripcion ?? '').toLowerCase().includes(termino)
    );
  });
  private getTunnelHeaders() {
    return new HttpHeaders({
      'X-Tunnel-Skip-AntiPhishing-Page': 'true',
      'Accept': 'application/json'
    });
  }

  ngOnInit(): void {
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.cargando.set(true);
    this.errorCarga.set('');

    this.http.get<ApiResponse<Rol[]>>(this.urlObtenerTodos, { headers: this.getTunnelHeaders() }).subscribe({
      next: (res) => {
        if (res && res.success && Array.isArray(res.data)) {
          const listaSaneada = res.data.map(rol => ({
            ...rol,
            estatus: rol.estatus ?? 1 
          }));
          this.roles.set(listaSaneada);
        } else {
          this.roles.set([]);
          console.warn('Formato de respuesta desconocido:', res);
        }
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar roles:', err);
        this.errorCarga.set(err.error?.message || 'No se pudieron cargar los roles. Verifica tu conexión.');
        this.cargando.set(false);
      }
    });
  }
  abrirVer(rol: Rol): void {
    this.rolSeleccionado.set(rol);
    this.modal.set('ver');
  }

  abrirCrear(): void {
    this.rolForm = {
      nombreRol: '',
      descripcion: '',
      estatus: 1
    };
    this.errorFormulario.set('');
    this.modal.set('crear');
  }

abrirEditar(rol: Rol): void {
  this.rolForm = { 
    ...rol,
    estatus: rol.estatus ?? 1 
  };
  this.errorFormulario.set('');
  this.modal.set('editar');
}

  abrirEliminar(rol: Rol): void {
    this.rolSeleccionado.set(rol);
    this.errorFormulario.set('');
    this.modal.set('eliminar');
  }

  cerrarModal(): void {
    this.modal.set('ninguno');
    this.rolSeleccionado.set(null);
    this.errorFormulario.set('');
  }
  guardarRol(): void {
    const f = this.rolForm;

    if (!f.nombreRol?.trim() || !f.descripcion?.trim()) {
      this.errorFormulario.set('Completa todos los campos obligatorios.');
      return;
    }

    this.guardando.set(true);
    this.errorFormulario.set('');

    if (this.modal() === 'crear') {
      const nuevoRol = {
        nombreRol: f.nombreRol.trim(),
        descripcion: f.descripcion.trim(),
         estatus: 1
      };

      this.http.post<ApiResponse<Rol>>(this.urlCrear, nuevoRol, { headers: this.getTunnelHeaders() }).subscribe({
        next: (res) => {
          if (res.success) {
            this.guardando.set(false);
            this.cerrarModal();
            this.cargarRoles();
          } else {
            this.guardando.set(false);
            this.errorFormulario.set(res.message || 'Error al guardar el rol.');
          }
        },
        error: (err) => {
          console.error(err);
          this.guardando.set(false);
          this.errorFormulario.set(err.error?.message || 'No se pudo registrar el rol.');
        }
      });
      return;
    }

    if (this.modal() === 'editar' && f.idRol) {
      const rolActualizado = {
        idRol: f.idRol,
        nombreRol: f.nombreRol.trim(),
        descripcion: f.descripcion.trim(),
        estatus: f.estatus 
      };
      this.http.put<ApiResponse<Rol>>(`${this.urlActualizar}/${f.idRol}`, rolActualizado, { headers: this.getTunnelHeaders() }).subscribe({
        next: (res) => {
          if (res.success) {
            this.guardando.set(false);
            this.cerrarModal();
            this.cargarRoles();
          } else {
            this.guardando.set(false);
            this.errorFormulario.set(res.message || 'Error al actualizar el rol.');
          }
        },
        error: (err) => {
          console.error(err);
          this.guardando.set(false);
          this.errorFormulario.set(err.error?.message || 'No se pudo actualizar el rol.');
        }
      });
    }
  }
  confirmarEliminar(): void {
    const rol = this.rolSeleccionado();
    if (!rol) return;

    this.guardando.set(true);
    this.errorFormulario.set('');
    this.http.put<ApiResponse<boolean>>(`${this.urlDesactivar}/${rol.idRol}`, {}, { headers: this.getTunnelHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.guardando.set(false);
          this.cerrarModal();
          this.cargarRoles();
        } else {
          this.guardando.set(false);
          this.errorFormulario.set(res.message || 'No se pudo desactivar el rol.');
        }
      },
      error: (err) => {
        console.error(err);
        this.guardando.set(false);
        this.errorFormulario.set(err.error?.message || 'Error de conexión con el servidor.');
      }
    });
  }
}