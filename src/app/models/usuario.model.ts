export interface Persona {
  idPersona?: number;
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  fechaNacimiento?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  fechaRegistro?: string;
}

export interface Rol {
  idRol: number;
  nombreRol: string;
}

export interface Usuario {
  idUsuario: number;
  idPersona?: number;
  idRol: number;
  contrasenaHash?: string | null;
  activo: boolean;
  persona?: Persona;
  rol?: Rol;
}

// Interfaz específica para enviar los datos al registrar un usuario web con persona incluida
export interface RegistrarUsuarioDto {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  fechaNacimiento?: string;
  telefono?: string;
  correo: string;
  direccion?: string;
  idRol: number;
  contrasenaHash: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: any;
}