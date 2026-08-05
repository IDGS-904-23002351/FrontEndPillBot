import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Categoria {
  idCategoria: number;
  nombreCategoria: string;
  descripcion?: string | null;
}

type ModoModal = 'ninguno' | 'ver' | 'crear' | 'editar' | 'eliminar';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: '../categorias/categorias.html',
  styleUrl: '../categorias/categorias.css'
})
export class CategoriasComponent implements OnInit {
  private http = inject(HttpClient);

  private readonly apiCategorias = `${environment.apiUrl}/api/categorias`;

  categorias = signal<Categoria[]>([]);
  busqueda = signal('');
  cargando = signal(false);
  errorCarga = signal('');

  modal = signal<ModoModal>('ninguno');
  categoriaSeleccionada = signal<Categoria | null>(null);
  categoriaForm: Partial<Categoria> = {};
  guardando = signal(false);
  errorFormulario = signal('');

  categoriasFiltradas = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    const lista = this.categorias();
    if (!termino) return lista;
    return lista.filter(c =>
      (c.nombreCategoria ?? '').toLowerCase().includes(termino) ||
      (c.descripcion ?? '').toLowerCase().includes(termino)
    );
  });

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.cargando.set(true);
    this.errorCarga.set('');
    this.http.get<Categoria[]>(this.apiCategorias).subscribe({
      next: (data) => {
        this.categorias.set(data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.errorCarga.set('No se pudieron cargar las categorías. Verifica la conexión con el servidor.');
        this.cargando.set(false);
      }
    });
  }

  // ---------- Modales ----------

  abrirVer(categoria: Categoria): void {
    this.categoriaSeleccionada.set(categoria);
    this.modal.set('ver');
  }

  abrirCrear(): void {
    this.categoriaForm = {
      nombreCategoria: '',
      descripcion: ''
    };
    this.errorFormulario.set('');
    this.modal.set('crear');
  }

  abrirEditar(categoria: Categoria): void {
    this.categoriaForm = { ...categoria };
    this.errorFormulario.set('');
    this.modal.set('editar');
  }

  abrirEliminar(categoria: Categoria): void {
    this.categoriaSeleccionada.set(categoria);
    this.modal.set('eliminar');
  }

  cerrarModal(): void {
    this.modal.set('ninguno');
    this.categoriaSeleccionada.set(null);
    this.errorFormulario.set('');
  }

  // ---------- Guardar (crear / editar) ----------

  guardarCategoria(): void {
    const f = this.categoriaForm;

    if (!f.nombreCategoria?.trim()) {
      this.errorFormulario.set('El nombre de la categoría es obligatorio.');
      return;
    }

    this.guardando.set(true);
    this.errorFormulario.set('');

    if (this.modal() === 'crear') {
      const nuevaCategoria = {
        nombreCategoria: f.nombreCategoria,
        descripcion: f.descripcion?.trim() ? f.descripcion : null
      };

      this.http.post(this.apiCategorias, nuevaCategoria).subscribe({
        next: () => {
          this.guardando.set(false);
          this.cerrarModal();
          this.cargarCategorias();
        },
        error: (err) => {
          this.guardando.set(false);
          this.errorFormulario.set(err?.error?.mensaje ?? 'No se pudo registrar la categoría.');
        }
      });
      return;
    }

    if (this.modal() === 'editar' && f.idCategoria) {
      const categoriaActualizada = {
        idCategoria: f.idCategoria,
        nombreCategoria: f.nombreCategoria,
        descripcion: f.descripcion?.trim() ? f.descripcion : null
      };

      this.http.put(`${this.apiCategorias}/${f.idCategoria}`, categoriaActualizada).subscribe({
        next: () => {
          this.guardando.set(false);
          this.cerrarModal();
          this.cargarCategorias();
        },
        error: (err) => {
          this.guardando.set(false);
          this.errorFormulario.set(err?.error?.mensaje ?? 'No se pudo actualizar la categoría.');
        }
      });
    }
  }

  // ---------- Eliminar ----------

  confirmarEliminar(): void {
    const categoria = this.categoriaSeleccionada();
    if (!categoria) return;

    this.guardando.set(true);
    this.errorFormulario.set('');
    this.http.delete(`${this.apiCategorias}/${categoria.idCategoria}`).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModal();
        this.cargarCategorias();
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorFormulario.set(err?.error?.mensaje ?? 'No se pudo eliminar la categoría.');
      }
    });
  }
}