// src/app/pages/productos/productos.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService, Producto, ApiResponse } from '../productos/producto.service';

type ModoModal = 'ninguno' | 'ver' | 'crear' | 'editar' | 'eliminar';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class Productos implements OnInit {
  
  // Variables de estado
  productos: Producto[] = [];
  busqueda: string = '';
  cargando: boolean = false;
  errorCarga: string = '';

  // Variables para el modal
  modal: ModoModal = 'ninguno';
  productoSeleccionado: Producto | null = null;
  productoForm: Partial<Producto> = {
    nombre: '',
    descripcion: '',
    precio: 0,
    sku: '',
    activo: true,
    foto: null
  };
  guardando: boolean = false;
  errorFormulario: string = '';

  constructor(private productoService: ProductoService) { }

  ngOnInit(): void {
    this.cargarProductos();
  }

  // GETTERS para filtros y estadísticas
  get productosFiltrados(): Producto[] {
    const termino = this.busqueda.trim().toLowerCase();
    if (!termino) return this.productos;
    return this.productos.filter(p =>
      (p.nombre ?? '').toLowerCase().includes(termino) ||
      (p.descripcion ?? '').toLowerCase().includes(termino) ||
      (p.sku ?? '').toLowerCase().includes(termino)
    );
  }

  get totalActivos(): number {
    return this.productos.filter(p => p.activo).length;
  }

  get totalInactivos(): number {
    return this.productos.filter(p => !p.activo).length;
  }

  // MÉTODOS PRINCIPALES
  cargarProductos(): void {
    this.cargando = true;
    this.errorCarga = '';

    this.productoService.consultarProductos().subscribe({
      next: (res) => {
        if (res && res.success && Array.isArray(res.data)) {
          this.productos = res.data;
        } else {
          this.productos = [];
          console.warn('Formato de respuesta desconocido:', res);
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.errorCarga = err.error?.message || 'No se pudieron cargar los productos. Verifica tu conexión.';
        this.cargando = false;
      }
    });
  }

  // MÉTODOS PARA ABRIR MODALES
  abrirVer(producto: Producto): void {
    this.productoSeleccionado = producto;
    this.modal = 'ver';
  }

  abrirCrear(): void {
    this.productoForm = {
      nombre: '',
      descripcion: '',
      precio: 0,
      sku: '',
      activo: true,
      foto: null
    };
    this.errorFormulario = '';
    this.modal = 'crear';
  }

  abrirEditar(producto: Producto): void {
    this.productoForm = { ...producto };
    this.errorFormulario = '';
    this.modal = 'editar';
  }

  abrirEliminar(producto: Producto): void {
    this.productoSeleccionado = producto;
    this.errorFormulario = '';
    this.modal = 'eliminar';
  }

  cerrarModal(): void {
    this.modal = 'ninguno';
    this.productoSeleccionado = null;
    this.errorFormulario = '';
  }

  // MANEJO DE ARCHIVOS PARA LA FOTO
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.productoForm.foto = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // GUARDAR PRODUCTO (CREAR O EDITAR)
  guardarProducto(): void {
    const f = this.productoForm;

    if (!f.nombre?.trim() || !f.sku?.trim() || !f.precio || f.precio <= 0) {
      this.errorFormulario = 'Completa todos los campos obligatorios (Nombre, SKU y Precio).';
      return;
    }

    this.guardando = true;
    this.errorFormulario = '';

    if (this.modal === 'crear') {
      const nuevoProducto = {
        nombre: f.nombre.trim(),
        descripcion: f.descripcion?.trim() || '',
        precio: f.precio,
        sku: f.sku.trim(),
        activo: true,
        foto: f.foto || null
      };

      this.productoService.registrarProducto(nuevoProducto).subscribe({
        next: (res) => {
          if (res.success) {
            this.guardando = false;
            this.cerrarModal();
            this.cargarProductos();
          } else {
            this.guardando = false;
            this.errorFormulario = res.message || 'Error al guardar el producto.';
          }
        },
        error: (err) => {
          console.error(err);
          this.guardando = false;
          this.errorFormulario = err.error?.message || 'No se pudo registrar el producto.';
        }
      });
      return;
    }

    if (this.modal === 'editar' && f.idProducto) {
      const productoActualizado = {
        idProducto: f.idProducto,
        nombre: f.nombre.trim(),
        descripcion: f.descripcion?.trim() || '',
        precio: f.precio,
        sku: f.sku.trim(),
        activo: f.activo,
        foto: f.foto || null
      };

      this.productoService.actualizarProducto(f.idProducto, productoActualizado).subscribe({
        next: (res) => {
          if (res.success) {
            this.guardando = false;
            this.cerrarModal();
            this.cargarProductos();
          } else {
            this.guardando = false;
            this.errorFormulario = res.message || 'Error al actualizar el producto.';
          }
        },
        error: (err) => {
          console.error(err);
          this.guardando = false;
          this.errorFormulario = err.error?.message || 'No se pudo actualizar el producto.';
        }
      });
    }
  }

  // ELIMINAR PRODUCTO (DESACTIVAR)
  confirmarEliminar(): void {
    const producto = this.productoSeleccionado;
    if (!producto) return;

    this.guardando = true;
    this.errorFormulario = '';

    this.productoService.desactivarProducto(producto.idProducto).subscribe({
      next: (res) => {
        if (res.success) {
          this.guardando = false;
          this.cerrarModal();
          this.cargarProductos();
        } else {
          this.guardando = false;
          this.errorFormulario = res.message || 'No se pudo desactivar el producto.';
        }
      },
      error: (err) => {
        console.error(err);
        this.guardando = false;
        this.errorFormulario = err.error?.message || 'Error de conexión con el servidor.';
      }
    });
  }

  // MÉTODO PARA FORMATEAR PRECIO
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(precio);
  }
}