import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  Rol,
  ApiResponse,
  RolFormData,
  ModoModal,
  EstadoRolEnum,
  ModalAction,
  DEFAULT_ROL_FORM,
  ROL_MESSAGES,
  ROL_CONFIG,
  isRolActivo,
  validateRolData,
  sanitizeRol,
  getEstadoLabel,
  getEstadoClass,
  rolToFormData
} from '../../app/models/roles.model';

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
  guardando = signal(false);
  
  errorCarga = signal('');
  errorFormulario = signal('');
  
  modal = signal<ModoModal>(ModalAction.NINGUNO);
  rolSeleccionado = signal<Rol | null>(null);
  
  rolForm: RolFormData = { ...DEFAULT_ROL_FORM };

  rolesFiltrados = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    const lista = this.roles();
    
    if (!termino) return lista;
    
    return lista.filter(r =>
      (r.nombreRol ?? '').toLowerCase().includes(termino) ||
      (r.descripcion ?? '').toLowerCase().includes(termino)
    );
  });

  totalRoles = computed(() => this.roles().length);
  
  rolesActivos = computed(() => 
    this.roles().filter(r => isRolActivo(r)).length
  );
  
  rolesInactivos = computed(() => 
    this.roles().filter(r => !isRolActivo(r)).length
  );

  ngOnInit(): void {
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.cargando.set(true);
    this.errorCarga.set('');

    this.http.get<ApiResponse<Rol[]>>(this.urlObtenerTodos, { 
      headers: this.getHeaders() 
    }).subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res.data)) {
          const listaSaneada = res.data.map(rol => ({
            ...rol,
            estatus: rol.estatus ?? EstadoRolEnum.ACTIVO
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
        this.errorCarga.set(err.error?.message || ROL_MESSAGES.LOAD_ERROR);
        this.cargando.set(false);
      }
    });
  }

  abrirVer(rol: Rol): void {
    this.rolSeleccionado.set(rol);
    this.modal.set(ModalAction.VER);
  }

  abrirCrear(): void {
    this.rolForm = { ...DEFAULT_ROL_FORM };
    this.errorFormulario.set('');
    this.modal.set(ModalAction.CREAR);
  }

  abrirEditar(rol: Rol): void {
    this.rolForm = rolToFormData(rol);
    this.errorFormulario.set('');
    this.modal.set(ModalAction.EDITAR);
  }

  abrirEliminar(rol: Rol): void {
    this.rolSeleccionado.set(rol);
    this.errorFormulario.set('');
    this.modal.set(ModalAction.ELIMINAR);
  }

  cerrarModal(): void {
    this.modal.set(ModalAction.NINGUNO);
    this.rolSeleccionado.set(null);
    this.errorFormulario.set('');
  }

  guardarRol(): void {
    const f = this.rolForm;

    const errors = validateRolData(f);
    if (errors.length > 0) {
      this.errorFormulario.set(errors.join('. '));
      return;
    }

    this.guardando.set(true);
    this.errorFormulario.set('');

    if (this.modal() === ModalAction.CREAR) {
      this.crearRol(f);
    } else if (this.modal() === ModalAction.EDITAR) {
      if (!f.idRol) {
        this.errorFormulario.set('ID de rol no encontrado');
        this.guardando.set(false);
        return;
      }
      this.actualizarRol(f);
    }
  }

  confirmarEliminar(): void {
    const rol = this.rolSeleccionado();
    if (!rol) return;

    this.guardando.set(true);
    this.errorFormulario.set('');

    this.http.put<ApiResponse<boolean>>(
      `${this.urlDesactivar}/${rol.idRol}`, 
      {}, 
      { headers: this.getHeaders() }
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.guardando.set(false);
          this.cerrarModal();
          this.cargarRoles();
        } else {
          this.guardando.set(false);
          this.errorFormulario.set(res.message || ROL_MESSAGES.DELETE_ERROR);
        }
      },
      error: (err) => {
        console.error(err);
        this.guardando.set(false);
        this.errorFormulario.set(err.error?.message || ROL_MESSAGES.CONNECTION_ERROR);
      }
    });
  }

  getEstadoLabel(estatus: number): string {
    return getEstadoLabel(estatus);
  }

  getEstadoClass(estatus: number): string {
    return getEstadoClass(estatus);
  }

  private crearRol(f: RolFormData): void {
    const nuevoRol = {
      nombreRol: f.nombreRol.trim(),
      descripcion: f.descripcion.trim(),
      estatus: EstadoRolEnum.ACTIVO
    };

    this.http.post<ApiResponse<Rol>>(
      this.urlCrear, 
      nuevoRol, 
      { headers: this.getHeaders() }
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.guardando.set(false);
          this.cerrarModal();
          this.cargarRoles();
        } else {
          this.guardando.set(false);
          this.errorFormulario.set(res.message || ROL_MESSAGES.CREATE_ERROR);
        }
      },
      error: (err) => {
        console.error(err);
        this.guardando.set(false);
        this.errorFormulario.set(err.error?.message || ROL_MESSAGES.CREATE_ERROR);
      }
    });
  }

  private actualizarRol(f: RolFormData): void {
    const rolActualizado = {
      idRol: f.idRol!, 
      nombreRol: f.nombreRol.trim(),
      descripcion: f.descripcion.trim(),
      estatus: f.estatus
    };

    this.http.put<ApiResponse<Rol>>(
      `${this.urlActualizar}/${f.idRol}`, 
      rolActualizado, 
      { headers: this.getHeaders() }
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.guardando.set(false);
          this.cerrarModal();
          this.cargarRoles();
        } else {
          this.guardando.set(false);
          this.errorFormulario.set(res.message || ROL_MESSAGES.UPDATE_ERROR);
        }
      },
      error: (err) => {
        console.error(err);
        this.guardando.set(false);
        this.errorFormulario.set(err.error?.message || ROL_MESSAGES.UPDATE_ERROR);
      }
    });
  }
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-Tunnel-Skip-AntiPhishing-Page': 'true',
      'Accept': 'application/json'
    });
  }
}