import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service'; // ← ajusta la ruta si es distinta


export interface CatalogoMedicamento {
  idMedicamento: number;
  nombreComercial: string;
  principioActivo: string;
  idCategoria?: number;
  idPresentacion?: number | null;
  idUnidadMedida?: number | null;
  gramaje?: string | null;
  fabricante?: string | null;
  requiereReceta: boolean;
  fechaRegistro?: string | null;
  activo: boolean;
  categoria?: string | null;
  presentacion?: string | null;
  unidadMedida?: string | null;
}

export interface Categoria {
  idCategoria: number;
  nombreCategoria: string;
  descripcion?: string | null;
}

export interface TipoPresentacion {
  idPresentacion: number;
  nombrePresentacion: string;
  descripcion?: string | null;
}

export interface UnidadMedida {
  idUnidadMedida: number;
  nombreUnidad: string;
  abreviatura: string;
  descripcion?: string | null;
}

type ModoModal = 'ninguno' | 'ver' | 'crear' | 'editar' | 'eliminar';

@Component({
  selector: 'app-medicamentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
templateUrl: '../medicamentos/medicamentos.html',
styleUrl: '../medicamentos/medicamentos.css'
})
export class MedicamentosComponent implements OnInit {
  private http = inject(HttpClient);

  private readonly apiMedicamentos = 'https://localhost:7046/api/catalogo/medicamentos';
  private readonly apiCategorias = 'https://localhost:7046/api/categorias';
  private readonly apiPresentaciones = 'https://localhost:7046/api/presentaciones';
  private readonly apiUnidadesMedida = 'https://localhost:7046/api/unidadesMedida';
  private auth = inject(AuthService);

  medicamentos = signal<CatalogoMedicamento[]>([]);
  categorias = signal<Categoria[]>([]);
  presentaciones = signal<TipoPresentacion[]>([]);
  unidadesMedida = signal<UnidadMedida[]>([]);

  busqueda = signal('');
  cargando = signal(false);
  errorCarga = signal('');

  modal = signal<ModoModal>('ninguno');
  medicamentoSeleccionado = signal<CatalogoMedicamento | null>(null);
  medicamentoForm: Partial<CatalogoMedicamento> = {};
  guardando = signal(false);
  errorFormulario = signal('');
  cargandoDetalle = signal(false);

medicamentosFiltrados = computed(() => {
  const termino = this.busqueda().trim().toLowerCase();
  let lista = this.medicamentos();

  // CAMBIO: si es médico, solo ve los que él registró
  if (this.auth.hasRole('medico')) {
    const propios = this.auth.getMedicamentosPropios();
    lista = lista.filter(m => propios.includes(m.idMedicamento));
  }

  if (!termino) return lista;
  return lista.filter(m =>
    (m.nombreComercial ?? '').toLowerCase().includes(termino) ||
    (m.principioActivo ?? '').toLowerCase().includes(termino)
  );
});

  ngOnInit(): void {
    this.cargarMedicamentos();
    this.cargarCategorias();
    this.cargarPresentaciones();
    this.cargarUnidadesMedida();
  }

  cargarMedicamentos(): void {
    this.cargando.set(true);
    this.errorCarga.set('');
    this.http.get<CatalogoMedicamento[]>(this.apiMedicamentos).subscribe({
      next: (data) => {
        this.medicamentos.set(data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.errorCarga.set('No se pudieron cargar los medicamentos. Verifica la conexión con el servidor.');
        this.cargando.set(false);
      }
    });
  }

  cargarCategorias(): void {
    this.http.get<Categoria[]>(this.apiCategorias).subscribe({
      next: (data) => this.categorias.set(data ?? []),
      error: () => this.categorias.set([])
    });
  }

  cargarPresentaciones(): void {
    this.http.get<TipoPresentacion[]>(this.apiPresentaciones).subscribe({
      next: (data) => this.presentaciones.set(data ?? []),
      error: () => this.presentaciones.set([])
    });
  }

  cargarUnidadesMedida(): void {
    this.http.get<UnidadMedida[]>(this.apiUnidadesMedida).subscribe({
      next: (data) => this.unidadesMedida.set(data ?? []),
      error: () => this.unidadesMedida.set([])
    });
  }

  // ---------- Modales ----------

  abrirVer(medicamento: CatalogoMedicamento): void {
    this.medicamentoSeleccionado.set(medicamento);
    this.modal.set('ver');
  }

  abrirCrear(): void {
    this.medicamentoForm = {
      nombreComercial: '',
      principioActivo: '',
      idCategoria: undefined,
      idPresentacion: undefined,
      idUnidadMedida: undefined,
      gramaje: '',
      requiereReceta: false
    };
    this.errorFormulario.set('');
    this.modal.set('crear');
  }

  // El listado (ConsultarMedicamentos) solo trae los NOMBRES de categoría,
  // presentación y unidad de medida, no sus IDs. Para poder precargar los
  // selects del formulario, se pide el registro completo por id.
  abrirEditar(medicamento: CatalogoMedicamento): void {
    this.errorFormulario.set('');
    this.cargandoDetalle.set(true);
    this.modal.set('editar');
    this.medicamentoForm = { ...medicamento };

    this.http.get<CatalogoMedicamento>(`${this.apiMedicamentos}/${medicamento.idMedicamento}`).subscribe({
      next: (data) => {
        this.medicamentoForm = { ...data };
        this.cargandoDetalle.set(false);
      },
      error: () => {
        this.errorFormulario.set('No se pudieron cargar los datos completos del medicamento.');
        this.cargandoDetalle.set(false);
      }
    });
  }

  abrirEliminar(medicamento: CatalogoMedicamento): void {
    this.medicamentoSeleccionado.set(medicamento);
    this.modal.set('eliminar');
  }

  cerrarModal(): void {
    this.modal.set('ninguno');
    this.medicamentoSeleccionado.set(null);
    this.errorFormulario.set('');
  }

  // ---------- Utilidad para el botón de "Requiere receta" ----------

  seleccionarRequiereReceta(valor: boolean): void {
    this.medicamentoForm.requiereReceta = valor;
  }

  // ---------- Guardar (crear / editar) ----------

  guardarMedicamento(): void {
    const f = this.medicamentoForm;

    if (!f.nombreComercial?.trim() || !f.principioActivo?.trim() || !f.idCategoria) {
      this.errorFormulario.set('Completa todos los campos obligatorios.');
      return;
    }

    this.guardando.set(true);
    this.errorFormulario.set('');

    if (this.modal() === 'crear') {
      const nuevoMedicamento = {
        nombreComercial: f.nombreComercial,
        principioActivo: f.principioActivo,
        idCategoria: f.idCategoria,
        idPresentacion: f.idPresentacion ?? null,
        idUnidadMedida: f.idUnidadMedida ?? null,
        gramaje: f.gramaje?.trim() ? f.gramaje : null,
        fabricante: null,
        requiereReceta: !!f.requiereReceta
      };

 this.http.post<{ mensaje: string; idMedicamento: number }>(this.apiMedicamentos, nuevoMedicamento).subscribe({
  next: (respuesta) => {
    // CAMBIO: guardamos el ID como "propio" del médico logueado
    if (respuesta?.idMedicamento) {
      this.auth.guardarMedicamentoPropio(respuesta.idMedicamento);
    }
    this.guardando.set(false);
    this.cerrarModal();
    this.cargarMedicamentos();
  },
  error: () => {
    this.guardando.set(false);
    this.errorFormulario.set('No se pudo registrar el medicamento.');
  }
});
      return;
    }

    if (this.modal() === 'editar' && f.idMedicamento) {
      const medicamentoActualizado = {
        idMedicamento: f.idMedicamento,
        nombreComercial: f.nombreComercial,
        principioActivo: f.principioActivo,
        idCategoria: f.idCategoria,
        idPresentacion: f.idPresentacion ?? null,
        idUnidadMedida: f.idUnidadMedida ?? null,
        gramaje: f.gramaje ?? null,
        fabricante: f.fabricante ?? null,
        requiereReceta: !!f.requiereReceta
      };

      this.http.put(`${this.apiMedicamentos}/${f.idMedicamento}`, medicamentoActualizado).subscribe({
        next: () => {
          this.guardando.set(false);
          this.cerrarModal();
          this.cargarMedicamentos();
        },
        error: () => {
          this.guardando.set(false);
          this.errorFormulario.set('No se pudo actualizar el medicamento.');
        }
      });
    }
  }

  // ---------- Eliminar (desactivar) ----------

  confirmarEliminar(): void {
    const medicamento = this.medicamentoSeleccionado();
    if (!medicamento) return;

    this.guardando.set(true);
    // El backend expone la desactivación como PUT, no como DELETE.
    this.http.put(`${this.apiMedicamentos}/desactivar/${medicamento.idMedicamento}`, {}).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModal();
        this.cargarMedicamentos();
      },
      error: () => {
        this.guardando.set(false);
        this.errorFormulario.set('No se pudo desactivar el medicamento.');
      }
    });
  }

  // ---------- Utilidades de presentación ----------

  formatearFecha(fecha?: string | null): string {
    if (!fecha) return '—';

    // Se parsean los componentes directamente del string en vez de usar
    // `new Date(...)`, porque el navegador reinterpreta la fecha con su
    // propia zona horaria y eso la desfasa una hora. Así se muestra
    // exactamente la fecha/hora que envía el backend, sin conversiones.
    const match = fecha.match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    if (!match) return '—';

    const [, anio, mes, dia, hora, minuto] = match;
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const horaNum = parseInt(hora, 10);
    const periodo = horaNum >= 12 ? 'p. m.' : 'a. m.';
    let hora12 = horaNum % 12;
    if (hora12 === 0) hora12 = 12;

    return `${parseInt(dia, 10)} ${meses[parseInt(mes, 10) - 1]} ${anio}, ${hora12}:${minuto} ${periodo}`;
  }
}