import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { InventarioProducto, InventarioProductoActualizar, RespuestaMensaje } from '../models/inventario.models';

@Component({
  selector: 'app-inventario-productos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './inventario-productos.html',
  styleUrls: ['./inventario-productos.css']
})
export class InventarioProductos implements OnInit {

  private readonly http = inject(HttpClient);

  private readonly apiInventario =
    `${environment.apiUrl}/api/admin/inventario-productos`;

  productos = signal<InventarioProducto[]>([]);

  busqueda = signal('');
  cargando = signal(false);
  actualizando = signal(false);

  mensaje = signal('');
  error = signal('');

  productoSeleccionado =
    signal<InventarioProducto | null>(null);

  nuevoStock = signal(0);
  mostrarModal = signal(false);

  productosFiltrados = computed(() => {
    const termino = this.busqueda()
      .trim()
      .toLowerCase();

    if (!termino) {
      return this.productos();
    }

    return this.productos().filter(producto => {
      const nombre =
        (producto.nombre ?? '').toLowerCase();

      const sku =
        (producto.sku ?? '').toLowerCase();

      const descripcion =
        (producto.descripcion ?? '').toLowerCase();

      return (
        nombre.includes(termino) ||
        sku.includes(termino) ||
        descripcion.includes(termino)
      );
    });
  });

  totalProductos = computed(() =>
    this.productos().length
  );

  totalExistencias = computed(() =>
    this.productos().reduce(
      (total, producto) =>
        total + producto.stock,
      0
    )
  );

  productosStockBajo = computed(() =>
    this.productos().filter(
      producto =>
        producto.stock > 0 &&
        producto.stock <= 5
    ).length
  );

  productosAgotados = computed(() =>
    this.productos().filter(
      producto => producto.stock === 0
    ).length
  );

  ngOnInit(): void {
    this.cargarInventario();
  }

  cargarInventario(): void {
    this.cargando.set(true);
    this.error.set('');

    this.http
      .get<InventarioProducto[]>(
        this.apiInventario
      )
      .subscribe({
        next: respuesta => {
          this.productos.set(respuesta ?? []);
          this.cargando.set(false);
        },

        error: errorHttp => {
          console.error(
            'Error al consultar el inventario:',
            errorHttp
          );

          this.productos.set([]);

          this.error.set(
            errorHttp?.error?.mensaje ??
            'No se pudo consultar el inventario de productos.'
          );

          this.cargando.set(false);
        }
      });
  }

  abrirActualizarStock(
    producto: InventarioProducto
  ): void {
    this.productoSeleccionado.set(producto);
    this.nuevoStock.set(producto.stock);

    this.mostrarModal.set(true);
    this.mensaje.set('');
    this.error.set('');
  }

  actualizarStock(): void {
    const producto =
      this.productoSeleccionado();

    if (!producto) {
      this.error.set(
        'No se seleccionó ningún producto.'
      );
      return;
    }

    const stock = Number(this.nuevoStock());

    if (
      Number.isNaN(stock) ||
      stock < 0
    ) {
      this.error.set(
        'El stock debe ser un número igual o mayor que cero.'
      );
      return;
    }

    const datos: InventarioProductoActualizar = {
      idProducto: producto.idProducto,
      stock
    };

    this.actualizando.set(true);
    this.error.set('');
    this.mensaje.set('');

    this.http
      .put<RespuestaMensaje>(
        this.apiInventario,
        datos
      )
      .subscribe({
        next: respuesta => {
          this.productos.update(lista =>
            lista.map(item =>
              item.idProducto === producto.idProducto
                ? {
                    ...item,
                    stock,
                    fechaActualizacion:
                      new Date().toISOString()
                  }
                : item
            )
          );

          this.mensaje.set(
            respuesta?.mensaje ??
            'Inventario actualizado correctamente.'
          );

          this.actualizando.set(false);
          this.mostrarModal.set(false);
          this.productoSeleccionado.set(null);
          this.nuevoStock.set(0);
        },

        error: errorHttp => {
          console.error(
            'Error al actualizar el inventario:',
            errorHttp
          );

          this.error.set(
            errorHttp?.error?.mensaje ??
            'No se pudo actualizar el inventario del producto.'
          );

          this.actualizando.set(false);
        }
      });
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
    this.productoSeleccionado.set(null);
    this.nuevoStock.set(0);
  }

  cambiarBusqueda(valor: string): void {
    this.busqueda.set(valor);
  }

  cambiarStock(valor: string | number): void {
    const stock = Number(valor);

    this.nuevoStock.set(
      Number.isNaN(stock)
        ? 0
        : stock
    );
  }

  obtenerClaseStock(stock: number): string {
    if (stock === 0) {
      return 'estado-stock agotado';
    }

    if (stock <= 5) {
      return 'estado-stock bajo';
    }

    return 'estado-stock disponible';
  }

  obtenerTextoStock(stock: number): string {
    if (stock === 0) {
      return 'Agotado';
    }

    if (stock <= 5) {
      return 'Stock bajo';
    }

    return 'Disponible';
  }
}