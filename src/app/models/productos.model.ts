export interface Producto {
  idProducto: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  sku: string;
  activo: boolean;
  foto: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type ModoModal = 'ninguno' | 'ver' | 'crear' | 'editar' | 'eliminar';

export interface ProductoForm {
  nombre: string;
  descripcion: string;
  precio: number;
  sku: string;
  activo: boolean;
  foto: string | null;
}

export interface NuevoProducto {
  nombre: string;
  descripcion: string;
  precio: number;
  sku: string;
  activo: boolean;
  foto: string | null;
}

export interface ProductoActualizado extends NuevoProducto {
  idProducto: number;
}