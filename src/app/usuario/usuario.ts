import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UsuarioService } from '../services/usuario.service';
import { Usuario } from '../models/usuario.model';

type ModoModal = 'ninguno' | 'ver' | 'crear' | 'editar' | 'eliminar';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario.html',
  styleUrl: './usuario.css'
})
export class UsuarioComponent implements OnInit {
  private usuarioService = inject(UsuarioService); // 👈 Inyectamos el servicio
  private router = inject(Router);
  private authService = inject(AuthService);

  usuarios = signal<Usuario[]>([]);
  busqueda = signal('');
  cargando = signal(false);
  errorCarga = signal('');

  listaRoles = [
    { idRol: 1, nombreRol: 'Administrador' },
    { idRol: 2, nombreRol: 'Cliente' },
    { idRol: 3, nombreRol: 'Farmacéutico' }
  ];

  modal = signal<ModoModal>('ninguno');
  usuarioSeleccionado = signal<Usuario | null>(null);
  usuarioForm: Partial<Usuario> & { idPersona?: number; contrasenaHash?: string } = {
    idRol: 1,
    idPersona: undefined,
    contrasenaHash: '',
    activo: true
  };
  guardando = signal(false);
  errorFormulario = signal('');

  usuariosFiltrados = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    const lista = this.usuarios();
    if (!termino) return lista;
    return lista.filter(u =>
      (u.persona?.correo ?? '').toLowerCase().includes(termino) ||
      (u.persona?.nombre ?? '').toLowerCase().includes(termino)
    );
  });

  totalActivos = computed(() => this.usuarios().filter(u => u.activo).length);
  totalInactivos = computed(() => this.usuarios().filter(u => !u.activo).length);

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  // Función para obtener el nombre del rol según su ID
  obtenerNombreRol(idRol: number): string {
    const rolEncontrado = this.listaRoles.find(r => r.idRol === idRol);
    return rolEncontrado ? rolEncontrado.nombreRol : `Rol ${idRol}`;
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.errorCarga.set('');

    this.usuarioService.obtenerUsuarios().subscribe({
      next: (res) => {
        if (res && res.success && Array.isArray(res.data)) {
          this.usuarios.set(res.data);
        } else {
          this.usuarios.set([]);
        }
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.errorCarga.set(err.error?.message || 'No se pudieron cargar los usuarios.');
        this.cargando.set(false);
      }
    });
  }

  abrirVer(usuario: Usuario): void {
    this.usuarioSeleccionado.set(usuario);
    this.modal.set('ver');
  }

  abrirCrear(): void {
    this.usuarioForm = { 
      idRol: 1, 
      idPersona: undefined, 
      contrasenaHash: '', 
      activo: true 
    };
    this.errorFormulario.set('');
    this.modal.set('crear');
  }

  abrirEditar(usuario: Usuario): void {
    this.usuarioForm = { 
      idUsuario: usuario.idUsuario,
      idRol: usuario.idRol,
      idPersona: usuario.idPersona,
      activo: usuario.activo,
      contrasenaHash: '' 
    };
    this.errorFormulario.set('');
    this.modal.set('editar');
  }

  abrirEliminar(usuario: Usuario): void {
    this.usuarioSeleccionado.set(usuario);
    this.errorFormulario.set('');
    this.modal.set('eliminar');
  }

  cerrarModal(): void {
    this.modal.set('ninguno');
    this.usuarioSeleccionado.set(null);
    this.errorFormulario.set('');
  }

  guardarUsuario(): void {
    const f = this.usuarioForm;

    if (!f.idRol) {
      this.errorFormulario.set('El rol es obligatorio.');
      return;
    }

    if (this.modal() === 'crear' && (!f.contrasenaHash?.trim() || !f.idPersona)) {
      this.errorFormulario.set('El ID de persona y la contraseña son obligatorios.');
      return;
    }

    this.guardando.set(true);
    this.errorFormulario.set('');

    if (this.modal() === 'crear') {
      const nuevoUsuario = {
        idPersona: f.idPersona!,
        idRol: f.idRol,
        contrasenaHash: f.contrasenaHash!
      };

      this.usuarioService.crearUsuario(nuevoUsuario).subscribe({
        next: (res) => {
          this.guardando.set(false);
          if (res.success) {
            this.cerrarModal();
            this.cargarUsuarios();
          } else {
            this.errorFormulario.set(res.message || 'Error al registrar usuario.');
          }
        },
        error: (err) => {
          this.guardando.set(false);
          this.errorFormulario.set(err.error?.message || 'Error de conexión.');
        }
      });
      return;
    }

    if (this.modal() === 'editar' && f.idUsuario) {
      const usuarioActualizado = {
        idRol: f.idRol,
        contrasenaHash: f.contrasenaHash?.trim() ? f.contrasenaHash : null,
        activo: f.activo ?? true
      };

      this.usuarioService.actualizarUsuario(f.idUsuario, usuarioActualizado).subscribe({
        next: (res) => {
          this.guardando.set(false);
          if (res.success) {
            this.cerrarModal();
            this.cargarUsuarios();
          } else {
            this.errorFormulario.set(res.message || 'Error al actualizar usuario.');
          }
        },
        error: (err) => {
          this.guardando.set(false);
          this.errorFormulario.set(err.error?.message || 'Error de conexión.');
        }
      });
    }
  }

  confirmarEliminar(): void {
    const usuario = this.usuarioSeleccionado();
    if (!usuario) return;

    this.guardando.set(true);
    this.errorFormulario.set('');

    this.usuarioService.desactivarUsuario(usuario.idUsuario).subscribe({
      next: (res) => {
        this.guardando.set(false);
        if (res.success) {
          this.cerrarModal();
          this.cargarUsuarios();
        } else {
          this.errorFormulario.set(res.message || 'No se pudo desactivar el usuario.');
        }
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorFormulario.set(err.error?.message || 'Error de conexión.');
      }
    });
  }
}