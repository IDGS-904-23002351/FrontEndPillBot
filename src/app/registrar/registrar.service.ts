
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario, UsuarioRegistroDto, UsuarioActualizacionDto, ApiResponse, Roles } from '../../app/models/registrar.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/api/admin/usuarios`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getUsuarios(): Observable<ApiResponse<Usuario[]>> {
    return this.http.get<ApiResponse<Usuario[]>>(`${this.apiUrl}/usuario`, {
      headers: this.getHeaders()
    });
  }

  getUsuarioById(id: number): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${this.apiUrl}/usuarioBuscar/${id}`, {
      headers: this.getHeaders()
    });
  }

  registrarUsuario(usuario: UsuarioRegistroDto): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(
      `${this.apiUrl}/agregarUsuario`,
      usuario,
      { headers: this.getHeaders() }
    );
  }

  actualizarUsuario(id: number, usuario: UsuarioActualizacionDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(
      `${this.apiUrl}/modificarUsuario/${id}`,
      usuario,
      { headers: this.getHeaders() }
    );
  }

  desactivarUsuario(id: number): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(
      `${this.apiUrl}/desactivar/${id}`,
      {},
      { headers: this.getHeaders() }
    );
  }
}