import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

// Modelo tal como lo devuelve GET /api/detalleReceta/receta/{id_receta}
// (mismos campos que el modelo DetalleReceta del backend, en camelCase)
export interface DetalleRecetaRaw {
  idDetalleReceta: number;
  idReceta: number;
  idMedicamento: number;
  dosis?: string | null;
  indicaciones?: string | null;
  frecuenciaHoras?: number | null;
  duracionDias?: number | null;
  numeroTratamiento?: number | null;
}

// Lo mismo, pero enriquecido para mostrar en la tabla
// (padecimiento de la receta actual + nombre comercial del medicamento)
export interface DetalleRecetaVista extends DetalleRecetaRaw {
  padecimiento: string;
  nombreComercial: string;
}

export interface Medicamento {
  idMedicamento: number;
  nombreComercial: string;
}

interface DetalleForm {
  idDetalleReceta?: number;
  idMedicamento?: number;
  dosis?: number | null;
  indicaciones?: string;
  frecuenciaHoras?: number | null;
  duracionDias?: number | null;
  numeroTratamiento?: number | null;
}

type ModoModal = 'ninguno' | 'crear' | 'editar';

@Component({
  selector: 'app-detalle-receta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalleReceta.html',
  styleUrl: './detalleReceta.css'
})
export class DetalleRecetaComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Ajusta esta base si tu backend corre en otro puerto/ruta
  private readonly apiDetalleReceta = 'https://localhost:7046/api/detalleReceta';
  private readonly apiMedicamentos = 'https://localhost:7046/api/catalogo/medicamentos';

  // id_receta con el que se llegó a esta pantalla (desde el ícono "+" de Recetas)
  idReceta = signal<number>(0);
  padecimientoReceta = signal<string>('');

  // Datos "crudos" que vienen del backend, sin enriquecer todavía
  detalles = signal<DetalleRecetaRaw[]>([]);
  medicamentos = signal<Medicamento[]>([]);
  busqueda = signal('');
  cargando = signal(false);
  errorCarga = signal('');

  modal = signal<ModoModal>('ninguno');
  detalleForm: DetalleForm = {};
  guardando = signal(false);
  errorFormulario = signal('');

  // Combina los detalles crudos con el padecimiento (de la receta actual)
  // y el nombre comercial (buscado en la lista de medicamentos)
  detallesVista = computed<DetalleRecetaVista[]>(() =>
    this.detalles().map(d => ({
      ...d,
      padecimiento: this.padecimientoReceta() || '—',
      nombreComercial: this.nombreMedicamento(d.idMedicamento)
    }))
  );

  detallesFiltrados = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    const lista = this.detallesVista();
    if (!termino) return lista;
    return lista.filter(d =>
      (d.padecimiento ?? '').toLowerCase().includes(termino) ||
      (d.nombreComercial ?? '').toLowerCase().includes(termino) ||
      (d.dosis ?? '').toLowerCase().includes(termino) ||
      (d.indicaciones ?? '').toLowerCase().includes(termino)
    );
  });

  ngOnInit(): void {
    // idReceta llega por parámetro de ruta: /detalle-receta/:idReceta
    const idRecetaParam = Number(this.route.snapshot.paramMap.get('idReceta'));
    this.idReceta.set(idRecetaParam || 0);

    const padecimientoParam = this.route.snapshot.queryParamMap.get('padecimiento');
    this.padecimientoReceta.set(padecimientoParam ?? '');

    this.cargarMedicamentos();
    this.cargarDetalles();
  }

  cargarDetalles(): void {
    this.cargando.set(true);
    this.errorCarga.set('');
    this.http.get<DetalleRecetaRaw[]>(`${this.apiDetalleReceta}/receta/${this.idReceta()}`).subscribe({
      next: (data) => {
        this.detalles.set(data ?? []);
        this.cargando.set(false);
      },
      error: (err) => {
        // El backend responde 404 cuando la receta aún no tiene detalles
        // registrados; eso no es un error real, solo significa lista vacía.
        if (err.status === 404) {
          this.detalles.set([]);
          this.cargando.set(false);
          return;
        }
        this.errorCarga.set('No se pudieron cargar los detalles de receta. Verifica la conexión con el servidor.');
        this.cargando.set(false);
      }
    });
  }

  cargarMedicamentos(): void {
    this.http.get<Medicamento[]>(this.apiMedicamentos).subscribe({
      next: (data) => this.medicamentos.set(data ?? []),
      error: () => this.medicamentos.set([])
    });
  }

  nombreMedicamento(idMedicamento?: number): string {
    if (!idMedicamento) return '—';
    const medicamento = this.medicamentos().find(m => m.idMedicamento === idMedicamento);
    return medicamento ? medicamento.nombreComercial : `Medicamento #${idMedicamento}`;
  }

  volver(): void {
    this.router.navigate(['/recetas']);
  }

  // ---------- Modales ----------

  abrirCrear(): void {
    this.detalleForm = {
      idMedicamento: undefined,
      dosis: null,
      indicaciones: '',
      frecuenciaHoras: null,
      duracionDias: null,
      numeroTratamiento: null
    };
    this.errorFormulario.set('');
    this.modal.set('crear');
  }

  abrirEditar(detalle: DetalleRecetaVista): void {
    this.detalleForm = {
      idDetalleReceta: detalle.idDetalleReceta,
      idMedicamento: detalle.idMedicamento,
      dosis: this.extraerNumeroDosis(detalle.dosis),
      indicaciones: detalle.indicaciones ?? '',
      frecuenciaHoras: detalle.frecuenciaHoras ?? null,
      duracionDias: detalle.duracionDias ?? null,
      numeroTratamiento: detalle.numeroTratamiento ?? null
    };
    this.errorFormulario.set('');
    this.modal.set('editar');
  }

  cerrarModal(): void {
    this.modal.set('ninguno');
    this.errorFormulario.set('');
  }

  // El backend guarda la dosis ya con la unidad concatenada (ej. "500 mg").
  // Para poder editar solo el número, se extrae la parte numérica.
  private extraerNumeroDosis(dosis?: string | null): number | null {
    if (!dosis) return null;
    const coincidencia = dosis.match(/[\d.]+/);
    return coincidencia ? Number(coincidencia[0]) : null;
  }

  // ---------- Guardar (crear / editar) ----------

  guardarDetalle(): void {
    const f = this.detalleForm;

    const camposValidos =
      !!f.idMedicamento &&
      f.dosis !== null && f.dosis !== undefined &&
      f.frecuenciaHoras !== null && f.frecuenciaHoras !== undefined &&
      f.duracionDias !== null && f.duracionDias !== undefined &&
      f.numeroTratamiento !== null && f.numeroTratamiento !== undefined;

    if (!camposValidos) {
      this.errorFormulario.set('Completa todos los campos obligatorios.');
      return;
    }

    this.guardando.set(true);
    this.errorFormulario.set('');

    if (this.modal() === 'crear') {
      const nuevoDetalle = {
        idReceta: this.idReceta(),
        idMedicamento: f.idMedicamento,
        dosis: String(f.dosis),
        indicaciones: f.indicaciones?.trim() ? f.indicaciones : null,
        frecuenciaHoras: f.frecuenciaHoras,
        duracionDias: f.duracionDias,
        numeroTratamiento: f.numeroTratamiento
      };

      this.http.post(this.apiDetalleReceta, nuevoDetalle).subscribe({
        next: () => {
          this.guardando.set(false);
          this.cerrarModal();
          this.cargarDetalles();
        },
        error: (err) => {
          this.guardando.set(false);
          this.errorFormulario.set(err?.error?.mensaje ?? 'No se pudo registrar el detalle de receta.');
        }
      });
      return;
    }

    if (this.modal() === 'editar' && f.idDetalleReceta) {
      const detalleActualizado = {
        idReceta: this.idReceta(),
        idMedicamento: f.idMedicamento,
        dosis: String(f.dosis),
        indicaciones: f.indicaciones?.trim() ? f.indicaciones : null,
        frecuenciaHoras: f.frecuenciaHoras,
        duracionDias: f.duracionDias,
        numeroTratamiento: f.numeroTratamiento
      };

      this.http.put(`${this.apiDetalleReceta}/${f.idDetalleReceta}`, detalleActualizado).subscribe({
        next: () => {
          this.guardando.set(false);
          this.cerrarModal();
          this.cargarDetalles();
        },
        error: (err) => {
          this.guardando.set(false);
          this.errorFormulario.set(err?.error?.mensaje ?? 'No se pudo actualizar el detalle de receta.');
        }
      });
    }
  }
}