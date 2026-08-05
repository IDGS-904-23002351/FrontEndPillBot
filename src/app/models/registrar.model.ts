// src/app/models/usuario.model.ts

export interface Usuario {
  idUsuario?: number;
  idPersona?: number;
  idRol: number;
  contrasenaHash: string;
  activo?: boolean;
  ultimoAcceso?: string;
  persona?: Persona;
}

export interface Persona {
  idPersona?: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  fechaNacimiento?: string | null;
  direccion?: string | null;
  correo: string;
  telefono?: string | null;
}

// src/app/models/registrar.model.ts

export interface UsuarioRegistroDto {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  fechaNacimiento?: string | null;
  telefono?: string | null;
  correo: string;
  direccion?: string | null;
  idRol: number;
  contrasenaHash: string;
}

export interface Roles {
  idRol: number;
  nombreRol: string;
  descripcion?: string | null;
  estatus?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string | null;
}

export interface UsuarioActualizacionDto {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  fechaNacimiento?: string | null;
  telefono?: string | null;
  correo: string;
  direccion?: string | null;
  idRol: number;
  contrasenaHash?: string | null;
  activo: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}