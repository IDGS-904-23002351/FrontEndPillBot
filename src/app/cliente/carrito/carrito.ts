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

export interface ProductoDisponible {
  idInventarioProd: number;
  idProducto: number;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  sku: string;
  stock: number;
  fechaActualizacion?: string | null;
  activo: boolean;
}

export interface CarritoDetalle {
  idCarrito: number;
  idDetalleCarrito: number;
  nombreArticulo: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface RespuestaMensaje {
  mensaje: string;
}

export interface RespuestaVenta {
  mensaje: string;
  id_venta: number;
}

interface UsuarioSesion {
  idUsuario?: number;
  id_usuario?: number;

  nombre?: string;
  nombreCompleto?: string;
  nombre_completo?: string;

  idRol?: number;
  id_rol?: number;

  rol?: string;
}

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

  
  private readonly apiProductos =
    'https://localhost:7046/api/admin/inventario-productos';

  private readonly apiCarrito =
    'https://localhost:7046/api/carrito';

  private readonly apiVentas =
    'https://localhost:7046/api/ventas';

  /*
   * Se obtendrá del usuario que haya iniciado sesión.
   */
  idUsuario = signal<number>(0);

  productos = signal<ProductoDisponible[]>([]);
  carrito = signal<CarritoDetalle[]>([]);

  busqueda = signal('');

  cargandoProductos = signal(false);
  cargandoCarrito = signal(false);
  procesandoVenta = signal(false);

  mensaje = signal('');
  errorCarga = signal('');

  productosFiltrados = computed(() => {
    const termino = this.busqueda()
      .trim()
      .toLowerCase();

    const productosDisponibles =
      this.productos().filter(producto =>
        producto.activo &&
        producto.stock > 0
      );

    if (!termino) {
      return productosDisponibles;
    }

    return productosDisponibles.filter(producto =>
      producto.nombre
        .toLowerCase()
        .includes(termino) ||

      producto.sku
        .toLowerCase()
        .includes(termino) ||

      (producto.descripcion ?? '')
        .toLowerCase()
        .includes(termino)
    );
  });

  cantidadTotal = computed(() =>
    this.carrito().reduce(
      (total, articulo) =>
        total + articulo.cantidad,
      0
    )
  );

  totalCarrito = computed(() =>
    this.carrito().reduce(
      (total, articulo) =>
        total + articulo.subtotal,
      0
    )
  );

  ngOnInit(): void {
    this.obtenerUsuarioSesion();

    /*
     * Solo se consultan las APIs cuando existe
     * un usuario válido en la sesión.
     */
    if (this.idUsuario() > 0) {
      this.cargarProductos();
      this.cargarCarrito();
    }
  }

  /*
   * Recupera la información que el login guardará
   * en sessionStorage.
   */
  obtenerUsuarioSesion(): void {
    const usuarioGuardado =
      sessionStorage.getItem('usuario');

    if (!usuarioGuardado) {
      this.errorCarga.set(
        'Debes iniciar sesión para utilizar el carrito.'
      );

      return;
    }

    try {
      const usuario: UsuarioSesion =
        JSON.parse(usuarioGuardado);

      const identificador =
        usuario.idUsuario ??
        usuario.id_usuario ??
        0;

      const idRol =
        usuario.idRol ??
        usuario.id_rol ??
        0;

      const nombreRol =
        usuario.rol?.toLowerCase() ?? '';

      if (!identificador) {
        this.errorCarga.set(
          'No se encontró el identificador del usuario que inició sesión.'
        );

        return;
      }

      /*
       * El rol Cliente tiene id_rol = 3.
       * También se acepta el texto "Cliente".
       */
      const esCliente =
        idRol === 3 ||
        nombreRol === 'cliente';

      if (!esCliente) {
        this.errorCarga.set(
          'Acceso denegado. Solo los clientes pueden utilizar el carrito.'
        );

        return;
      }

      this.idUsuario.set(identificador);

    } catch (error) {
      console.error(
        'Error al leer la sesión del usuario:',
        error
      );

      this.errorCarga.set(
        'No se pudo leer la información de la sesión.'
      );
    }
  }

  cargarProductos(): void {
    this.cargandoProductos.set(true);
    this.errorCarga.set('');

    this.http
      .get<ProductoDisponible[]>(
        this.apiProductos
      )
      .subscribe({
        next: data => {
          this.productos.set(data ?? []);
          this.cargandoProductos.set(false);
        },
        error: error => {
          console.error(
            'Error al consultar productos:',
            error
          );

          this.productos.set([]);

          this.errorCarga.set(
            error?.error?.mensaje ??
            'No se pudieron cargar los pastilleros disponibles.'
          );

          this.cargandoProductos.set(false);
        }
      });
  }

  cargarCarrito(): void {
    if (this.idUsuario() <= 0) {
      this.errorCarga.set(
        'No existe un usuario válido para consultar el carrito.'
      );

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
            'Error al consultar carrito:',
            error
          );

          /*
           * Si todavía no existe carrito, se muestra vacío.
           */
          if (error.status === 404) {
            this.carrito.set([]);
            this.cargandoCarrito.set(false);
            return;
          }

          this.errorCarga.set(
            error?.error?.mensaje ??
            'No se pudo consultar el carrito.'
          );

          this.cargandoCarrito.set(false);
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
        'Debes iniciar sesión para agregar productos.'
      );

      return;
    }

    if (!cantidad || cantidad <= 0) {
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

    /*
     * Solo se venden pastilleros.
     * Por eso idProducto lleva valor
     * e idMedicamento siempre va en null.
     */
    const datos = {
      idUsuario: this.idUsuario(),
      idProducto: producto.idProducto,
      idMedicamento: null,
      cantidad: cantidad,
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
            respuesta.mensaje
          );

          /*
           * Después de agregar, vuelve a consultar
           * el carrito para mostrar el registro real.
           */
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

    /*
     * Se guarda el total antes de que el backend
     * cambie el estado del carrito.
     */
    const totalCompra =
      this.totalCarrito();

    this.http
      .post<RespuestaVenta>(
        `${this.apiVentas}/procesar`,
        venta
      )
      .subscribe({
        next: respuesta => {
          this.procesandoVenta.set(false);

          /*
           * Guarda temporalmente la venta procesada
           * para mostrarla en la pantalla Compras.
           */
          sessionStorage.setItem(
            'ultimaCompra',
            JSON.stringify({
              idVenta: respuesta.id_venta,
              total: totalCompra,
              estadoPago: 'Pagado',
              estadoEnvio: 'Pendiente',
              mensaje: respuesta.mensaje
            })
          );

          this.router.navigate([
            '/cliente/compras'
          ]);
        },
        error: error => {
          console.error(
            'Error al procesar venta:',
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
