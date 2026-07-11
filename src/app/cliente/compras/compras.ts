import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface CompraProcesada {
  idVenta: number;
  total: number;
  estadoPago: string;
  estadoEnvio: string;
  mensaje: string;
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

  compra = signal<CompraProcesada | null>(
    null
  );

  ngOnInit(): void {
    this.cargarUltimaCompra();
  }

  cargarUltimaCompra(): void {
    const compraGuardada =
      sessionStorage.getItem('ultimaCompra');

    if (!compraGuardada) {
      this.compra.set(null);
      return;
    }

    try {
      const compra: CompraProcesada =
        JSON.parse(compraGuardada);

      this.compra.set(compra);

    } catch (error) {
      console.error(
        'No se pudo leer la compra procesada:',
        error
      );

      this.compra.set(null);
    }
  }
}
