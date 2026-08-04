import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario, ApiResponse } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/admin/usuarios`;

  obtenerUsuarios(): Observable<ApiResponse<Usuario[]>> {
    return this.http.get<ApiResponse<Usuario[]>>(`${this.apiUrl}/usuario`);
  }

  crearUsuario(nuevoUsuario: { idPersona: number; idRol: number; contrasenaHash: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/agregarUsuario`, nuevoUsuario);
  }

  actualizarUsuario(id: number, usuarioActualizado: { idRol: number; contrasenaHash?: string | null; activo: boolean }): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/modificarUsuario/${id}`, usuarioActualizado);
  }

  desactivarUsuario(id: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/desactivar/${id}`, {});
  }
}