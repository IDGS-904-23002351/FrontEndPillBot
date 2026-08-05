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
