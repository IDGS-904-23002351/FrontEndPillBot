export interface Receta {
  idReceta: number;
  idCliente: number;
  nombreMedico: string;
  cedulaProfesional?: string | null;
  fechaEmision?: string | null;
  observaciones?: string | null;
  padecimiento?: string | null;
  activo?: boolean;
}

export interface Cliente {
  idCliente: number;
  nombreCompleto: string;
}