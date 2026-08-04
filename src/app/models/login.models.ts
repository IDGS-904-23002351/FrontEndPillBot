export interface LoginCredentials {
  correo: string;
  contrasena: string;
  dispositivo: string;
  ipOrigen: string;
  detallesNavegador: string;
}

export interface LoginResponse {
  data?: {
    nombreRol?: string;
    token?: string;
    usuario?: {
      id: number;
      nombre: string;
      correo: string;
      rol: string;
    };
  };
  message?: string;
  success?: boolean;
}

export interface UsuarioLogin {
  correo: string;
  contrasena: string;
}

export interface ErrorMessage {
  status: number;
  message: string;
  timestamp?: string;
  path?: string;
}

export interface RutasPorRol {
  [key: string]: string;
}

export enum Roles {
  ADMINISTRADOR = 'administrador',
  MEDICO = 'medico',
  CLIENTE = 'cliente'
}

export enum HttpStatus {
  OK = 200,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  CONNECTION_ERROR = 0
}

export interface LoginConfig {
  deviceInfo: {
    dispositivo: string;
    ipOrigen: string;
    detallesNavegador: string;
  };
  redirectDelay: number;
  errorClearDelay: number;
}

export const ERROR_MESSAGES = {
  REQUIRED_FIELDS: 'Por favor complete todos los campos',
  INVALID_EMAIL: 'Por favor ingrese un correo electrónico válido',
  UNAUTHORIZED: 'Credenciales incorrectas. Verifique su correo y contraseña.',
  USER_NOT_FOUND: 'Usuario no encontrado. Por favor verifique sus datos.',
  SERVER_ERROR: 'Error del servidor. Intente más tarde.',
  CONNECTION_ERROR: 'Error de conexión. Verifique su conexión a internet.',
  ROLE_NOT_DETERMINED: 'No se pudo determinar el rol del usuario',
  GENERIC_ERROR: 'Error al iniciar sesión. Intente nuevamente.'
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '¡Inicio de sesión exitoso! Redirigiendo...'
} as const;

export const RUTAS_POR_ROL: RutasPorRol = {
  [Roles.ADMINISTRADOR]: '/admin/dashboard',
  [Roles.MEDICO]: '/medico/expediente-clinico',
  [Roles.CLIENTE]: '/cliente/carrito'
};

export const DEFAULT_LOGIN_CONFIG: LoginConfig = {
  deviceInfo: {
    dispositivo: 'Navegador',
    ipOrigen: '127.0.0.1',
    detallesNavegador: 'Angular Web'
  },
  redirectDelay: 1500,
  errorClearDelay: 5000
};