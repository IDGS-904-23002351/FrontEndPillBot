import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  DashboardVentasResponse,
  VentaAdmin,
  VentaPeriodo
} from '../models/dashboardVentas.models';

@Component({
  selector: 'app-dashboard-ventas',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './dashboard-ventas.html',
  styleUrls: ['./dashboard-ventas.css']
})
export class DashboardVentas implements OnInit {

  private readonly http = inject(HttpClient);

  private readonly apiDashboard =
    `${environment.apiUrl}/api/dashboard/ventas`;

  private readonly apiVentas =
    `${environment.apiUrl}/api/admin/ventas`;

  estadisticas = signal<DashboardVentasResponse>({
    totalVentas: 0,
    totalIngresos: 0,
    productosVendidos: 0,
    ticketPromedio: 0
  });

  ventasPorPeriodo = signal<VentaPeriodo[]>([]);

  cargando = signal(false);
  mensaje = signal('');
  error = signal('');

  mayorNumeroVentas = computed(() => {
    const valores = this.ventasPorPeriodo()
      .map(item => item.ventas);

    return valores.length > 0
      ? Math.max(...valores)
      : 1;
  });

  promedioProductosPorVenta = computed(() => {
    const totalVentas =
      this.estadisticas().totalVentas;

    if (totalVentas <= 0) {
      return 0;
    }

    return (
      this.estadisticas().productosVendidos /
      totalVentas
    );
  });

  ngOnInit(): void {
    this.cargarDashboard();
  }

  cargarDashboard(): void {

    this.cargando.set(true);
    this.error.set('');
    this.mensaje.set('');

    forkJoin({

      estadisticas:
        this.http.get<DashboardVentasResponse>(
          this.apiDashboard
        ),

      ventas:
        this.http.get<VentaAdmin[]>(
          this.apiVentas
        )

    }).subscribe({

      next: respuesta => {

        this.estadisticas.set(
          respuesta.estadisticas ?? {
            totalVentas: 0,
            totalIngresos: 0,
            productosVendidos: 0,
            ticketPromedio: 0
          }
        );

        this.generarPeriodos(
          respuesta.ventas ?? []
        );

        this.cargando.set(false);

      },

      error: errorHttp => {

        console.error(
          'Error al consultar el dashboard:',
          errorHttp
        );

        this.estadisticas.set({
          totalVentas: 0,
          totalIngresos: 0,
          productosVendidos: 0,
          ticketPromedio: 0
        });

        this.ventasPorPeriodo.set([]);

        this.error.set(
          errorHttp?.error?.mensaje ??
          errorHttp?.error?.message ??
          'No se pudieron consultar las estadísticas de ventas.'
        );

        this.cargando.set(false);

      }

    });

  }

  private generarPeriodos(
    ventas: VentaAdmin[]
  ): void {

    const agrupadas =
      new Map<string, VentaPeriodo>();

    ventas.forEach(venta => {

      if (!venta.fechaVenta) {
        return;
      }

      const fecha =
        new Date(venta.fechaVenta);

      if (Number.isNaN(fecha.getTime())) {
        return;
      }

      const clave =
        this.obtenerClaveFecha(fecha);

      const periodoExistente =
        agrupadas.get(clave);

      if (periodoExistente) {

        periodoExistente.ventas += 1;

        periodoExistente.ingresos +=
          Number(venta.total ?? 0);

        return;
      }

      agrupadas.set(clave, {

        fecha: clave,

        etiqueta:
          this.obtenerEtiquetaFecha(fecha),

        ventas: 1,

        ingresos:
          Number(venta.total ?? 0)

      });

    });

    const periodos =
      Array.from(agrupadas.values())
        .sort((a, b) =>
          a.fecha.localeCompare(b.fecha)
        );

    this.ventasPorPeriodo.set(periodos);

  }

  private obtenerClaveFecha(
    fecha: Date
  ): string {

    const anio =
      fecha.getFullYear();

    const mes =
      String(fecha.getMonth() + 1)
        .padStart(2, '0');

    const dia =
      String(fecha.getDate())
        .padStart(2, '0');

    return `${anio}-${mes}-${dia}`;

  }

  private obtenerEtiquetaFecha(
    fecha: Date
  ): string {

    return new Intl.DateTimeFormat(
      'es-MX',
      {
        day: '2-digit',
        month: 'short'
      }
    ).format(fecha);

  }

  obtenerAnchoBarra(
    ventas: number
  ): number {

    const mayor =
      this.mayorNumeroVentas();

    if (mayor <= 0) {
      return 0;
    }

    return (
      ventas /
      mayor
    ) * 100;

  }

}