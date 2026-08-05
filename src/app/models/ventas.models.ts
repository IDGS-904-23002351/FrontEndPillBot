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

export interface VentaDetalleAdmin {
  idVenta: number;
  idCliente: number;
  cliente: string;
  subtotal: number;
  iva: number;
  total: number;
  estadoPago: string;
  estadoEnvio: string;
  fechaVenta?: string | null;

  idDetalleVenta: number;
  idProducto?: number | null;
  idMedicamento?: number | null;
  articulo: string;
  cantidad: number;
  precioUnitario: number;
  subtotalDetalle: number;
}

export interface RespuestaMensaje {
  mensaje: string;
}