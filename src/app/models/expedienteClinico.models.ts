export interface ClienteExpediente {
  usuarioId: number;
  nombreCompleto: string;
  correo: string;
  telefono?: string | null;
  direccion?: string | null;
  tipoSangre?: string | null;
  alergias?: string | null;
  contactoEmergencia?: string | null;
  telefonoEmergencia?: string | null;
}