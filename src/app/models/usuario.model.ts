export interface Persona {
  idPersona?: number;
  nombre?: string;
  correo?: string;
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

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: any;
}