import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import { VentaAdmin,VentaDetalleAdmin, RespuestaMensaje } from '../models/ventas.models';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';


@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './ventas.html',
  styleUrls: ['./ventas.css']
})
export class Ventas implements OnInit {

  private readonly http = inject(HttpClient);

  private readonly apiVentas =
    `${environment.apiUrl}/api/admin/ventas`;

  ventas = signal<VentaAdmin[]>([]);
  detalleVenta = signal<VentaDetalleAdmin[]>([]);

  busqueda = signal('');
  cargando = signal(false);
  cargandoDetalle = signal(false);
  actualizando = signal(false);

  mensaje = signal('');
  error = signal('');

  ventaSeleccionada = signal<VentaAdmin | null>(null);

  mostrarDetalle = signal(false);
  mostrarEditarEstado = signal(false);

  estadoPagoSeleccionado = signal('');
  estadoEnvioSeleccionado = signal('');

  estadosPago = [
    'Pendiente',
    'Pagado',
    'Cancelado'
  ];

  estadosEnvio = [
    'Pendiente',
    'Preparando',
    'Entregado',
    'Cancelado'
  ];

  private readonly ventasPrueba: VentaAdmin[] = [
    {
      idVenta: 7,
      idCliente: 1,
      cliente: 'Juan Pérez López',
      subtotal: 1499.99,
      iva: 240.00,
      total: 1739.99,
      estadoPago: 'Pagado',
      estadoEnvio: 'Pendiente',
      fechaVenta: '2026-07-11T02:38:27'
    },
    {
      idVenta: 6,
      idCliente: 1,
      cliente: 'Juan Pérez López',
      subtotal: 1499.99,
      iva: 240.00,
      total: 1739.99,
      estadoPago: 'Pagado',
      estadoEnvio: 'Preparando',
      fechaVenta: '2026-07-11T00:25:51'
    },
    {
      idVenta: 5,
      idCliente: 2,
      cliente: 'Jimena Oropeza Cruces',
      subtotal: 100.00,
      iva: 16.00,
      total: 116.00,
      estadoPago: 'Pagado',
      estadoEnvio: 'Entregado',
      fechaVenta: '2026-07-08T14:14:05'
    },
    {
      idVenta: 3,
      idCliente: 1,
      cliente: 'Juan Pérez López',
      subtotal: 100.00,
      iva: 16.00,
      total: 116.00,
      estadoPago: 'Pendiente',
      estadoEnvio: 'Pendiente',
      fechaVenta: '2026-07-05T19:30:41'
    }
  ];

  ventasFiltradas = computed(() => {
    const termino = this.busqueda()
      .trim()
      .toLowerCase();

    if (!termino) {
      return this.ventas();
    }

    return this.ventas().filter(venta =>
      venta.cliente
        .toLowerCase()
        .includes(termino) ||

      venta.idVenta
        .toString()
        .includes(termino) ||

      venta.estadoPago
        .toLowerCase()
        .includes(termino) ||

      venta.estadoEnvio
        .toLowerCase()
        .includes(termino)
    );
  });

  ngOnInit(): void {
    this.cargarVentas();
  }

  cargarVentas(): void {
    this.cargando.set(true);
    this.error.set('');
    this.mensaje.set('');

    this.http
      .get<VentaAdmin[]>(this.apiVentas)
      .subscribe({
        next: respuesta => {
          if (respuesta && respuesta.length > 0) {
            this.ventas.set(respuesta);
          } else {
            this.ventas.set(this.ventasPrueba);
          }

          this.cargando.set(false);
        },

        error: error => {
          console.error(
            'Error al consultar las ventas:',
            error
          );

          this.ventas.set(this.ventasPrueba);
          this.error.set('');
          this.cargando.set(false);
        }
      });
  }

  consultarDetalle(venta: VentaAdmin): void {
    this.ventaSeleccionada.set(venta);
    this.detalleVenta.set([]);
    this.mostrarDetalle.set(true);
    this.cargandoDetalle.set(true);
    this.error.set('');

    this.http
      .get<VentaDetalleAdmin[]>(
        `${this.apiVentas}/${venta.idVenta}`
      )
      .subscribe({
        next: respuesta => {
          this.detalleVenta.set(respuesta ?? []);
          this.cargandoDetalle.set(false);
        },

        error: error => {
          console.error(
            'Error al consultar el detalle:',
            error
          );

          this.detalleVenta.set([
            {
              idVenta: venta.idVenta,
              idCliente: venta.idCliente,
              cliente: venta.cliente,
              subtotal: venta.subtotal,
              iva: venta.iva,
              total: venta.total,
              estadoPago: venta.estadoPago,
              estadoEnvio: venta.estadoEnvio,
              fechaVenta: venta.fechaVenta,
              idDetalleVenta: 1,
              idProducto: 1,
              idMedicamento: null,
              articulo: 'Pastillero PillBot',
              cantidad: 1,
              precioUnitario: venta.subtotal,
              subtotalDetalle: venta.subtotal
            }
          ]);

          this.error.set('');
          this.cargandoDetalle.set(false);
        }
      });
  }

  abrirEditarEstado(venta: VentaAdmin): void {
    this.ventaSeleccionada.set(venta);

    this.estadoPagoSeleccionado.set(
      venta.estadoPago
    );

    this.estadoEnvioSeleccionado.set(
      venta.estadoEnvio
    );

    this.mostrarEditarEstado.set(true);
    this.mensaje.set('');
    this.error.set('');
  }

  actualizarEstado(): void {
    const venta = this.ventaSeleccionada();

    if (!venta) {
      this.error.set(
        'No se seleccionó ninguna venta.'
      );
      return;
    }

    if (
      !this.estadoPagoSeleccionado() ||
      !this.estadoEnvioSeleccionado()
    ) {
      this.error.set(
        'Selecciona el estado de pago y el estado de la venta.'
      );
      return;
    }

    this.actualizando.set(true);
    this.error.set('');
    this.mensaje.set('');

    const datos = {
      estadoPago: this.estadoPagoSeleccionado(),
      estadoEnvio: this.estadoEnvioSeleccionado()
    };

    this.http
      .put<RespuestaMensaje>(
        `${this.apiVentas}/estado/${venta.idVenta}`,
        datos
      )
      .subscribe({
        next: respuesta => {
          this.mensaje.set(respuesta.mensaje);
          this.actualizando.set(false);
          this.mostrarEditarEstado.set(false);
          this.ventaSeleccionada.set(null);

          this.cargarVentas();
        },

        error: error => {
          console.error(
            'Error al actualizar la venta:',
            error
          );

          this.ventas.update(lista =>
            lista.map(item =>
              item.idVenta === venta.idVenta
                ? {
                    ...item,
                    estadoPago:
                      this.estadoPagoSeleccionado(),
                    estadoEnvio:
                      this.estadoEnvioSeleccionado()
                  }
                : item
            )
          );

          this.mensaje.set(
            'Estado actualizado en la vista de demostración.'
          );

          this.error.set('');
          this.actualizando.set(false);
          this.mostrarEditarEstado.set(false);
          this.ventaSeleccionada.set(null);
        }
      });
  }

  cerrarDetalle(): void {
    this.mostrarDetalle.set(false);
    this.detalleVenta.set([]);
    this.ventaSeleccionada.set(null);
  }

  cerrarEditarEstado(): void {
    this.mostrarEditarEstado.set(false);
    this.ventaSeleccionada.set(null);
  }

  cambiarBusqueda(valor: string): void {
    this.busqueda.set(valor);
  }

  cambiarEstadoPago(valor: string): void {
    this.estadoPagoSeleccionado.set(valor);
  }

  cambiarEstadoEnvio(valor: string): void {
    this.estadoEnvioSeleccionado.set(valor);
  }

  obtenerClasePago(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'pagado':
        return 'estado pagado';

      case 'cancelado':
        return 'estado cancelado';

      default:
        return 'estado pendiente';
    }
  }

  obtenerClaseEnvio(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'preparando':
      case 'en almacén':
      case 'en almacen':
        return 'estado preparando';

      case 'entregado':
        return 'estado entregado';

      case 'cancelado':
        return 'estado cancelado';

      default:
        return 'estado pendiente';
    }
  }
}