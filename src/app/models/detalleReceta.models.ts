// Modelo tal como lo devuelve GET /api/detalleReceta/receta/{id_receta}
// (mismos campos que el modelo DetalleReceta del backend, en camelCase)
export interface DetalleRecetaRaw {
  idDetalleReceta: number;
  idReceta: number;
  idMedicamento: number;
  dosis?: string | null;
  indicaciones?: string | null;
  frecuenciaHoras?: number | null;
  duracionDias?: number | null;
  numeroTratamiento?: number | null;
}

// Lo mismo, pero enriquecido para mostrar en la tabla
// (padecimiento de la receta actual + nombre comercial del medicamento)
export interface DetalleRecetaVista extends DetalleRecetaRaw {
  padecimiento: string;
  nombreComercial: string;
}

export interface Medicamento {
  idMedicamento: number;
  nombreComercial: string;
}