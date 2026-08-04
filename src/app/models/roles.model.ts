export interface Rol {
  idRol: number;
  nombreRol: string;
  descripcion: string;
  estatus: number; 
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface RolFormData {
  idRol?: number;  
  nombreRol: string;
  descripcion: string;
  estatus: number;
}

export interface RolFilters {
  busqueda: string;
  estatus?: number;
  fechaInicio?: string;
  fechaFin?: string;
}

export type ModoModal = 'ninguno' | 'ver' | 'crear' | 'editar' | 'eliminar';

export type EstadoRol = 0 | 1;

export enum EstadoRolEnum {
  INACTIVO = 0,
  ACTIVO = 1
}

export enum ModalAction {
  NINGUNO = 'ninguno',
  VER = 'ver',
  CREAR = 'crear',
  EDITAR = 'editar',
  ELIMINAR = 'eliminar'
}

export const ESTADOS_ROL = [
  { value: 1, label: 'Activo', class: 'badge-success' },
  { value: 0, label: 'Inactivo', class: 'badge-danger' }
] as const;

export const ESTADO_LABELS: Record<number, string> = {
  1: 'Activo',
  0: 'Inactivo'
};

export const ESTADO_COLORS: Record<number, string> = {
  1: 'success',
  0: 'danger'
};

export const ROL_MESSAGES = {
  LOAD_SUCCESS: 'Roles cargados correctamente',
  CREATE_SUCCESS: 'Rol creado exitosamente',
  UPDATE_SUCCESS: 'Rol actualizado exitosamente',
  DELETE_SUCCESS: 'Rol desactivado exitosamente',
  
  LOAD_ERROR: 'No se pudieron cargar los roles. Verifica tu conexión.',
  CREATE_ERROR: 'No se pudo registrar el rol.',
  UPDATE_ERROR: 'No se pudo actualizar el rol.',
  DELETE_ERROR: 'No se pudo desactivar el rol.',
  CONNECTION_ERROR: 'Error de conexión con el servidor.',
  UNKNOWN_ERROR: 'Ocurrió un error inesperado.',
  
  REQUIRED_FIELDS: 'Completa todos los campos obligatorios.',
  INVALID_NAME: 'El nombre del rol debe tener al menos 3 caracteres.',
  INVALID_DESCRIPTION: 'La descripción debe tener al menos 10 caracteres.',
  
  CONFIRM_DELETE: '¿Estás seguro de que deseas desactivar este rol?',
  CONFIRM_DELETE_TITLE: 'Confirmar desactivación'
} as const;

export const DEFAULT_ROL_FORM: RolFormData = {
  nombreRol: '',
  descripcion: '',
  estatus: EstadoRolEnum.ACTIVO
};

export const DEFAULT_ROL_FILTERS: RolFilters = {
  busqueda: '',
  estatus: undefined
};

export function isRolActivo(rol: Rol): boolean {
  return rol.estatus === EstadoRolEnum.ACTIVO;
}

export function isRolInactivo(rol: Rol): boolean {
  return rol.estatus === EstadoRolEnum.INACTIVO;
}

export function getEstadoLabel(estatus: number): string {
  return ESTADO_LABELS[estatus] || 'Desconocido';
}

export function getEstadoClass(estatus: number): string {
  return ESTADO_COLORS[estatus] || 'secondary';
}

export function validateRolData(data: Partial<RolFormData>): string[] {
  const errors: string[] = [];

  if (!data.nombreRol?.trim()) {
    errors.push('El nombre del rol es obligatorio');
  } else if (data.nombreRol.trim().length < 3) {
    errors.push('El nombre del rol debe tener al menos 3 caracteres');
  }

  if (!data.descripcion?.trim()) {
    errors.push('La descripción del rol es obligatoria');
  } else if (data.descripcion.trim().length < 10) {
    errors.push('La descripción debe tener al menos 10 caracteres');
  }

  return errors;
}

export function sanitizeRol(rol: Partial<RolFormData>): Partial<RolFormData> {
  return {
    ...rol,
    nombreRol: rol.nombreRol?.trim() || '',
    descripcion: rol.descripcion?.trim() || '',
    estatus: rol.estatus ?? EstadoRolEnum.ACTIVO
  };
}

export function areRolesEqual(rol1: Rol, rol2: Rol): boolean {
  return rol1.idRol === rol2.idRol &&
         rol1.nombreRol === rol2.nombreRol &&
         rol1.descripcion === rol2.descripcion &&
         rol1.estatus === rol2.estatus;
}

export function rolToFormData(rol: Rol): RolFormData {
  return {
    idRol: rol.idRol,
    nombreRol: rol.nombreRol,
    descripcion: rol.descripcion,
    estatus: rol.estatus
  };
}

export const ROL_CONFIG = {
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 50,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 255,
  
  PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  CACHE_TTL: 300000, 
  ENDPOINTS: {
    BASE: '/api/rol',
    GET_ALL: '/api/rol/roles',
    CREATE: '/api/rol/crearRoles',
    UPDATE: '/api/rol/actualizarRol',
    DELETE: '/api/rol/desactivar'
  }
} as const;