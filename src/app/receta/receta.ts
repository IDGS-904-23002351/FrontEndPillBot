import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // ← ajusta la ruta si es distinta

export interface Receta {
  idReceta: number;
  idCliente: number;
  nombreMedico: string;
  cedulaProfesional?: string | null;
  fechaEmision?: string | null;
  observaciones?: string | null;
  padecimiento?: string | null;
  activo?: boolean;
}

export interface Cliente {
  idCliente: number;
  nombreCompleto: string;
}

type ModoModal = 'ninguno' | 'ver' | 'crear' | 'editar' | 'eliminar';

@Component({
  selector: 'app-receta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './Receta.html',
  styleUrl: './receta.css'
})
export class RecetaComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService); // ← nuevo


  // Ajusta esta base si tu backend corre en otro puerto/ruta
  private readonly apiRecetas = 'https://localhost:7046/api/recetas';
  // Se asume un endpoint que regresa { idCliente, nombreCompleto } para el selector.
  private readonly apiClientes = 'https://localhost:7046/api/clientes';

  recetas = signal<Receta[]>([]);
  clientes = signal<Cliente[]>([]);
  busqueda = signal('');
  cargando = signal(false);
  errorCarga = signal('');

  modal = signal<ModoModal>('ninguno');
  recetaSeleccionada = signal<Receta | null>(null);
  recetaForm: Partial<Receta> = {};
  guardando = signal(false);
  errorFormulario = signal('');

  recetasFiltradas = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    const lista = this.recetas();
    if (!termino) return lista;
    return lista.filter(r =>
      (r.nombreMedico ?? '').toLowerCase().includes(termino) ||
      (r.padecimiento ?? '').toLowerCase().includes(termino) ||
      (r.cedulaProfesional ?? '').toLowerCase().includes(termino) ||
      this.nombreCliente(r.idCliente).toLowerCase().includes(termino)
    );
  });

  ngOnInit(): void {
    this.cargarRecetas();
    this.cargarClientes();
  }

  cargarRecetas(): void {
    this.cargando.set(true);
    this.errorCarga.set('');
    this.http.get<Receta[]>(this.apiRecetas).subscribe({
      next: (data) => {
        this.recetas.set(data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.errorCarga.set('No se pudieron cargar las recetas. Verifica la conexión con el servidor.');
        this.cargando.set(false);
      }
    });
  }

  cargarClientes(): void {
    this.http.get<Cliente[]>(this.apiClientes).subscribe({
      next: (data) => this.clientes.set(data ?? []),
      error: () => this.clientes.set([])
    });
  }

  nombreCliente(idCliente: number): string {
    const cliente = this.clientes().find(c => c.idCliente === idCliente);
    return cliente ? cliente.nombreCompleto : `Cliente #${idCliente}`;
  }

  // ---------- Navegación a Detalle de Receta ----------

  irDetalleReceta(receta: Receta): void {
    const base = this.obtenerBasePorRol();
    this.router.navigate([`${base}/detalle-receta`, receta.idReceta], {
      queryParams: { padecimiento: receta.padecimiento ?? '' }
    });
  }

  private obtenerBasePorRol(): string {
    const rol = this.authService.getRol()?.toLowerCase();
    if (rol === 'medico') return '/medico';
    if (rol === 'administrador') return '/admin';
    return ''; // fallback a la ruta top-level sin layout
  }

  // ---------- Modales ----------

  abrirVer(receta: Receta): void {
    this.recetaSeleccionada.set(receta);
    this.modal.set('ver');
  }

  abrirCrear(): void {
    this.recetaForm = {
      idCliente: undefined,
      nombreMedico: '',
      cedulaProfesional: '',
      padecimiento: '',
      observaciones: ''
    };
    this.errorFormulario.set('');
    this.modal.set('crear');
  }

  abrirEditar(receta: Receta): void {
    this.recetaForm = { ...receta };
    this.errorFormulario.set('');
    this.modal.set('editar');
  }

  abrirEliminar(receta: Receta): void {
    this.recetaSeleccionada.set(receta);
    this.modal.set('eliminar');
  }

  cerrarModal(): void {
    this.modal.set('ninguno');
    this.recetaSeleccionada.set(null);
    this.errorFormulario.set('');
  }

  // ---------- Guardar (crear / editar) ----------

  guardarReceta(): void {
    const f = this.recetaForm;

    if (!f.idCliente || !f.nombreMedico?.trim() || !f.cedulaProfesional?.trim() || !f.padecimiento?.trim()) {
      this.errorFormulario.set('Completa todos los campos obligatorios.');
      return;
    }

    this.guardando.set(true);
    this.errorFormulario.set('');

    if (this.modal() === 'crear') {
      const nuevaReceta = {
        idCliente: f.idCliente,
        nombreMedico: f.nombreMedico,
        cedulaProfesional: f.cedulaProfesional,
        fechaEmision: null, // el backend la calcula automáticamente
        observaciones: f.observaciones?.trim() ? f.observaciones : null,
        padecimiento: f.padecimiento,
        activo: true
      };

      this.http.post(this.apiRecetas, nuevaReceta).subscribe({
        next: () => {
          this.guardando.set(false);
          this.cerrarModal();
          this.cargarRecetas();
        },
        error: () => {
          this.guardando.set(false);
          this.errorFormulario.set('No se pudo registrar la receta.');
        }
      });
      return;
    }

    if (this.modal() === 'editar' && f.idReceta) {
      const recetaActualizada = {
        idReceta: f.idReceta,
        idCliente: f.idCliente,
        nombreMedico: f.nombreMedico,
        cedulaProfesional: f.cedulaProfesional,
        fechaEmision: f.fechaEmision,
        observaciones: f.observaciones?.trim() ? f.observaciones : null,
        padecimiento: f.padecimiento,
        activo: true
      };

      this.http.put(`${this.apiRecetas}/${f.idReceta}`, recetaActualizada).subscribe({
        next: () => {
          this.guardando.set(false);
          this.cerrarModal();
          this.cargarRecetas();
        },
        error: () => {
          this.guardando.set(false);
          this.errorFormulario.set('No se pudo actualizar la receta.');
        }
      });
    }
  }

  // ---------- Eliminar (desactivar) ----------

  confirmarEliminar(): void {
    const receta = this.recetaSeleccionada();
    if (!receta) return;

    this.guardando.set(true);
    this.http.delete(`${this.apiRecetas}/${receta.idReceta}`).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModal();
        this.cargarRecetas();
      },
      error: () => {
        this.guardando.set(false);
        this.errorFormulario.set('No se pudo desactivar la receta.');
      }
    });
  }

  // ---------- Utilidades de presentación ----------

  formatearFecha(fecha?: string | null): string {
    if (!fecha) return '—';
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: '2-digit' }) +
      ' ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }
}