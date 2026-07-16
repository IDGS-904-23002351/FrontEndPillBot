import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

export interface CompraCliente {
  idVenta: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  totalVenta: number;
  estadoPago?: string | null;
  estadoEnvio?: string | null;
  fechaVenta?: string | null;
}

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './compras.html',
  styleUrl: './compras.css'
})
export class Compras implements OnInit {

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private readonly apiVentas =
    `${environment.apiUrl}/api/ventas`;

  compras = signal<CompraCliente[]>([]);

  cargando = signal(false);
  errorCarga = signal('');

  ngOnInit(): void {
    this.cargarCompras();
  }

  cargarCompras(): void {
    const idUsuario =
      this.authService.getIdUsuario();

    const rol =
      this.authService.getRol()
        ?.trim()
        .toLowerCase();

    this.errorCarga.set('');

    if (!idUsuario) {
      this.compras.set([]);

      this.errorCarga.set(
        'Debes iniciar sesión para consultar tus compras.'
      );

      return;
    }

    if (rol !== 'cliente') {
      this.compras.set([]);

      this.errorCarga.set(
        'Acceso denegado. Este módulo corresponde al cliente.'
      );

      return;
    }

    this.cargando.set(true);

    this.http
      .get<CompraCliente[]>(
        `${this.apiVentas}/cliente/${idUsuario}`
      )
      .subscribe({
        next: respuesta => {
          this.compras.set(respuesta ?? []);
          this.cargando.set(false);
        },
        error: error => {
          console.error(
            'Error al consultar las compras:',
            error
          );

          this.compras.set([]);
          this.cargando.set(false);

          this.errorCarga.set(
            error?.error?.mensaje ??
            'No se pudo consultar el historial de compras.'
          );
        }
      });
  }

  formatearFecha(
    fecha?: string | null
  ): string {

    if (!fecha) {
      return 'Sin fecha';
    }

    const fechaCompra = new Date(fecha);

    if (Number.isNaN(fechaCompra.getTime())) {
      return 'Sin fecha';
    }

    return fechaCompra.toLocaleString(
      'es-MX',
      {
        dateStyle: 'medium',
        timeStyle: 'short'
      }
    );
  }

  claseEstadoPago(
    estado?: string | null
  ): string {

    const valor =
      estado?.trim().toLowerCase() ?? '';

    if (valor === 'pagado') {
      return 'estado-pagado';
    }

    if (valor === 'cancelado') {
      return 'estado-cancelado';
    }

    return 'estado-pendiente';
  }

  claseEstadoEnvio(
    estado?: string | null
  ): string {

    const valor =
      estado?.trim().toLowerCase() ?? '';

    if (valor === 'entregado') {
      return 'estado-entregado';
    }

    if (valor === 'preparando') {
      return 'estado-preparando';
    }

    if (valor === 'cancelado') {
      return 'estado-cancelado';
    }

    return 'estado-pendiente';
  }
}
