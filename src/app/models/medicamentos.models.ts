export interface CatalogoMedicamento {
  idMedicamento: number;
  nombreComercial: string;
  principioActivo: string;
  idCategoria?: number;
  idPresentacion?: number | null;
  idUnidadMedida?: number | null;
  gramaje?: string | null;
  fabricante?: string | null;
  requiereReceta: boolean;
  fechaRegistro?: string | null;
  activo: boolean;
  categoria?: string | null;
  presentacion?: string | null;
  unidadMedida?: string | null;
}

export interface Categoria {
  idCategoria: number;
  nombreCategoria: string;
  descripcion?: string | null;
}

export interface TipoPresentacion {
  idPresentacion: number;
  nombrePresentacion: string;
  descripcion?: string | null;
}

export interface UnidadMedida {
  idUnidadMedida: number;
  nombreUnidad: string;
  abreviatura: string;
  descripcion?: string | null;
}