import {
  Component,
  OnInit,
  inject,
  signal,
  computed
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { ProductoDisponible, CarritoDetalle, RespuestaMensaje, RespuestaVenta } from '../../models/carrito.model';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css'
})
export class Carrito implements OnInit {

  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  private readonly apiProductos =
    `${environment.apiUrl}/api/admin/inventario-productos`;

  private readonly apiCarrito =
    `${environment.apiUrl}/api/carrito`;

  private readonly apiVentas =
    `${environment.apiUrl}/api/ventas`;

  idUsuario = signal<number>(0);

  productos = signal<ProductoDisponible[]>([]);
  carrito = signal<CarritoDetalle[]>([]);

  busqueda = signal('');

  cargandoProductos = signal(false);
  cargandoCarrito = signal(false);
  procesandoVenta = signal(false);
  eliminandoDetalle = signal<number | null>(null);

  mensaje = signal('');
  errorCarga = signal('');

  productosFiltrados = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();

    const disponibles = this.productos().filter(producto =>
      producto.activo && producto.stock > 0
    );

    if (!termino) {
      return disponibles;
    }

    return disponibles.filter(producto =>
      producto.nombre.toLowerCase().includes(termino) ||
      producto.sku.toLowerCase().includes(termino) ||
      (producto.descripcion ?? '').toLowerCase().includes(termino)
    );
  });

  cantidadTotal = computed(() =>
    this.carrito().reduce(
      (total, articulo) => total + articulo.cantidad,
      0
    )
  );

  totalCarrito = computed(() =>
    this.carrito().reduce(
      (total, articulo) => total + articulo.subtotal,
      0
    )
  );

  ivaCarrito = computed(() =>
    this.totalCarrito() * 0.16
  );

  totalFinal = computed(() =>
    this.totalCarrito() + this.ivaCarrito()
  );

  ngOnInit(): void {
    this.obtenerUsuarioSesion();

    if (this.idUsuario() > 0) {
      this.cargarProductos();
      this.cargarCarrito();
    }
  }

  obtenerUsuarioSesion(): void {
    const idUsuario = this.authService.getIdUsuario();
    const rol = this.authService.getRol()
      ?.trim()
      .toLowerCase();

    if (!idUsuario) {
      this.errorCarga.set(
        'Debes iniciar sesión para utilizar el carrito.'
      );
      return;
    }

    if (rol !== 'cliente') {
      this.errorCarga.set(
        'Acceso denegado. Solo los clientes pueden utilizar el carrito.'
      );
      return;
    }

    this.idUsuario.set(idUsuario);
  }

  cargarProductos(): void {
    this.cargandoProductos.set(true);
    this.errorCarga.set('');

    this.http
      .get<ProductoDisponible[]>(this.apiProductos)
      .subscribe({
        next: data => {
          this.productos.set(data ?? []);
          this.cargandoProductos.set(false);
        },
        error: error => {
          console.error(
            'Error al consultar pastilleros:',
            error
          );

          this.productos.set([]);
          this.cargandoProductos.set(false);

          this.errorCarga.set(
            error?.error?.mensaje ??
            'No se pudieron cargar los pastilleros disponibles.'
          );
        }
      });
  }

  cargarCarrito(): void {
    if (this.idUsuario() <= 0) {
      return;
    }

    this.cargandoCarrito.set(true);
    this.errorCarga.set('');

    this.http
      .get<CarritoDetalle[]>(
        `${this.apiCarrito}/${this.idUsuario()}`
      )
      .subscribe({
        next: data => {
          this.carrito.set(data ?? []);
          this.cargandoCarrito.set(false);
        },
        error: error => {
          console.error(
            'Error al consultar el carrito:',
            error
          );

          if (error.status === 404) {
            this.carrito.set([]);
            this.cargandoCarrito.set(false);
            return;
          }

          this.carrito.set([]);
          this.cargandoCarrito.set(false);

          this.errorCarga.set(
            error?.error?.mensaje ??
            'No se pudo consultar el carrito.'
          );
        }
      });
  }

  agregarAlCarrito(
    producto: ProductoDisponible,
    cantidadTexto: string
  ): void {

    const cantidad = Number(cantidadTexto);

    this.mensaje.set('');
    this.errorCarga.set('');

    if (this.idUsuario() <= 0) {
      this.errorCarga.set(
        'Debes iniciar sesión para agregar pastilleros.'
      );
      return;
    }

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      this.errorCarga.set(
        'Ingresa una cantidad válida.'
      );
      return;
    }

    if (cantidad > producto.stock) {
      this.errorCarga.set(
        `Solo existen ${producto.stock} unidades disponibles.`
      );
      return;
    }

    const datos = {
      idUsuario: this.idUsuario(),
      idProducto: producto.idProducto,
      idMedicamento: null,
      cantidad,
      precioUnitario: producto.precio
    };

    this.http
      .post<RespuestaMensaje>(
        `${this.apiCarrito}/agregar`,
        datos
      )
      .subscribe({
        next: respuesta => {
          this.mensaje.set(
            respuesta.mensaje ??
            'Pastillero agregado correctamente.'
          );

          this.cargarCarrito();
        },
        error: error => {
          console.error(
            'Error al agregar al carrito:',
            error
          );

          this.errorCarga.set(
            error?.error?.mensaje ??
            'No se pudo agregar el pastillero al carrito.'
          );
        }
      });
  }

  eliminarDelCarrito(articulo: CarritoDetalle): void {
    this.mensaje.set('');
    this.errorCarga.set('');

    const confirmar = window.confirm(
      `¿Deseas eliminar "${articulo.nombreArticulo}" del carrito?`
    );

    if (!confirmar) {
      return;
    }

    this.eliminandoDetalle.set(
      articulo.idDetalleCarrito
    );

    this.http
      .delete<RespuestaMensaje>(
        `${this.apiCarrito}/eliminar/${articulo.idDetalleCarrito}`
      )
      .subscribe({
        next: respuesta => {
          this.eliminandoDetalle.set(null);

          this.mensaje.set(
            respuesta.mensaje ??
            'Artículo eliminado del carrito correctamente.'
          );

          this.cargarCarrito();
        },
        error: error => {
          console.error(
            'Error al eliminar el artículo del carrito:',
            error
          );

          this.eliminandoDetalle.set(null);

          this.errorCarga.set(
            error?.error?.mensaje ??
            'No se pudo eliminar el artículo del carrito.'
          );
        }
      });
  }

  confirmarCompra(): void {
    this.mensaje.set('');
    this.errorCarga.set('');

    if (this.idUsuario() <= 0) {
      this.errorCarga.set(
        'Debes iniciar sesión para procesar la compra.'
      );
      return;
    }

    if (this.carrito().length === 0) {
      this.errorCarga.set(
        'El carrito está vacío.'
      );
      return;
    }

    this.procesandoVenta.set(true);

    const venta = {
      idUsuario: this.idUsuario(),
      estadoPago: 'Pagado',
      estadoEnvio: 'Pendiente'
    };

    this.http
      .post<RespuestaVenta>(
        `${this.apiVentas}/procesar`,
        venta
      )
      .subscribe({
        next: respuesta => {
          this.procesandoVenta.set(false);

          this.mensaje.set(
            respuesta.mensaje ??
            'Venta procesada correctamente.'
          );

          this.router.navigate([
            '/cliente/compras'
          ]);
        },
        error: error => {
          console.error(
            'Error al procesar la compra:',
            error
          );

          this.procesandoVenta.set(false);

          this.errorCarga.set(
            error?.error?.mensaje ??
            'No se pudo procesar la compra.'
          );
        }
      });
  }
}
