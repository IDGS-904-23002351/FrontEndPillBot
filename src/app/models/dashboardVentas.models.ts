export interface DashboardVentasResponse {
  totalVentas: number;
  totalIngresos: number;
  productosVendidos: number;
  ticketPromedio: number;
}

export interface VentaAdmin {
  idVenta: number;
  idCliente: number;
  cliente: string;
  subtotal: number;
  iva: number;
  total: number;
  estadoPago: string;
  estadoEnvio: string;
  fechaVenta?: string | null;
}

export interface VentaPeriodo {
  fecha: string;
  etiqueta: string;
  ventas: number;
  ingresos: number;
}