export interface InventarioProducto {
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

export interface InventarioProductoActualizar {
  idProducto: number;
  stock: number;
}

export interface RespuestaMensaje {
  mensaje: string;
}