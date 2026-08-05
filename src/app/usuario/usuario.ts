import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UsuarioService } from '../services/usuario.service';
import { Usuario } from '../models/usuario.model';

type ModoModal = 'ninguno' | 'ver' | 'crear' | 'editar' | 'eliminar';

export interface Rol {
  idRol: number;
  nombreRol: string;
}

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario.html',
  styleUrl: './usuario.css'
})
export class UsuarioComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private authService = inject(AuthService);

  usuarios = signal<Usuario[]>([]);
  listaRoles = signal<Rol[]>([]);
  busqueda = signal('');
  cargando = signal(false);
  errorCarga = signal('');
  modal = signal<ModoModal>('ninguno');
  usuarioSeleccionado = signal<Usuario | null>(null);
  
  usuarioForm: {
    idUsuario?: number;
    idRol?: number;
    nombre?: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
    fechaNacimiento?: string;
    telefono?: string;
    correo?: string;
    direccion?: string;
    contrasenaHash?: string;
    activo?: boolean;
  } = { idRol: undefined, nombre: '', apellidoPaterno: '', apellidoMaterno: '', fechaNacimiento: '', telefono: '', correo: '', direccion: '', contrasenaHash: '', activo: true };

  guardando = signal(false);
  errorFormulario = signal('');

  usuariosFiltrados = computed(() => {
    const t = this.busqueda().trim().toLowerCase();
    const l = this.usuarios();
    return !t ? l : l.filter(u => (u.persona?.correo ?? '').toLowerCase().includes(t) || (u.persona?.nombre ?? '').toLowerCase().includes(t));
  });

  totalActivos = computed(() => this.usuarios().filter(u => u.activo).length);
  totalInactivos = computed(() => this.usuarios().filter(u => !u.activo).length);

  ngOnInit(): void {
    this.cargarRoles();
    this.cargarUsuarios();
  }
  
  obtenerNombreRol(idRol: number): string {
    return this.listaRoles().find(r => r.idRol === idRol)?.nombreRol ?? `Rol ${idRol}`;
  }

  cargarRoles(): void {
    this.usuarioService.obtenerRoles().subscribe({
      next: (res: any) => this.listaRoles.set(Array.isArray(res) ? res : (res?.success && Array.isArray(res.data) ? res.data : [])),
      error: (err) => console.error('Error al cargar roles:', err)
    });
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.errorCarga.set('');
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (res: any) => {
        this.usuarios.set(res?.success && Array.isArray(res.data) ? res.data : []);
        this.cargando.set(false);
      },
      error: (err) => {
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
    this.usuarioForm = { idRol: undefined, nombre: '', apellidoPaterno: '', apellidoMaterno: '', fechaNacimiento: '', telefono: '', correo: '', direccion: '', contrasenaHash: '', activo: true };
    this.errorFormulario.set('');
    this.modal.set('crear');
  }

  abrirEditar(usuario: Usuario): void {
    this.usuarioForm = { 
      idUsuario: usuario.idUsuario,
      idRol: usuario.idRol,
      nombre: usuario.persona?.nombre || '',
      apellidoPaterno: usuario.persona?.apellidoPaterno || '',
      apellidoMaterno: usuario.persona?.apellidoMaterno || '',
      fechaNacimiento: usuario.persona?.fechaNacimiento ? usuario.persona.fechaNacimiento.split('T')[0] : '',
      telefono: usuario.persona?.telefono || '',
      correo: usuario.persona?.correo || '',
      direccion: usuario.persona?.direccion || '',
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
    if (!f.idRol) return this.errorFormulario.set('El rol es obligatorio.');
    if (!f.nombre?.trim() || !f.apellidoPaterno?.trim() || !f.correo?.trim()) return this.errorFormulario.set('Nombre, apellido paterno y correo son obligatorios.');
    if (this.modal() === 'crear' && !f.contrasenaHash?.trim()) return this.errorFormulario.set('La contraseña es obligatoria para nuevos usuarios.');

    this.guardando.set(true);
    this.errorFormulario.set('');

    const m = this.modal();
    const datos: any = {
      nombre: f.nombre!,
      apellidoPaterno: f.apellidoPaterno!,
      apellidoMaterno: f.apellidoMaterno || '',
      fechaNacimiento: f.fechaNacimiento || null,
      telefono: f.telefono || '',
      correo: f.correo!,
      direccion: f.direccion || '',
      idRol: f.idRol,
      contrasenaHash: m === 'crear' ? f.contrasenaHash! : (f.contrasenaHash?.trim() ? f.contrasenaHash : null),
      activo: f.activo ?? true
    };

    const peticion = m === 'crear' 
      ? this.usuarioService.crearUsuario(datos) 
      : this.usuarioService.actualizarUsuario(f.idUsuario!, datos);

    peticion.subscribe({
      next: (res: any) => {
        this.guardando.set(false);
        this.cerrarModal();
        this.cargarUsuarios();
      },
      error: (err) => {
        this.guardando.set(false);
        this.cerrarModal();
        this.cargarUsuarios();
      }
    });
  }

  confirmarEliminar(): void {
    const u = this.usuarioSeleccionado();
    if (!u) return;
    this.guardando.set(true);
    this.errorFormulario.set('');
    this.usuarioService.desactivarUsuario(u.idUsuario).subscribe({
      next: (res: any) => {
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