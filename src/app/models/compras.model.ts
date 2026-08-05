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
