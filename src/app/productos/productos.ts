import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Producto, ApiResponse } from '../../app/models/productos.model';

@Injectable({
  providedIn: 'root'
})
export class Productos {

  constructor(private http: HttpClient) { }

  private readonly apiBase = `${environment.apiUrl}/api/catalogo/productos`;

  private getHeaders() {
    return new HttpHeaders({
      'X-Tunnel-Skip-AntiPhishing-Page': 'true',
      'Accept': 'application/json'
    });
  }

  consultarProductos(): Observable<ApiResponse<Producto[]>> {
    return this.http.get<ApiResponse<Producto[]>>(
      `${this.apiBase}/consultarProductos`,
      { headers: this.getHeaders() }
    );
  }

  registrarProducto(producto: Partial<Producto>): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiBase}/registrar`,
      producto,
      { headers: this.getHeaders() }
    );
  }

  actualizarProducto(id: number, producto: Partial<Producto>): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiBase}/actualizarProducto/${id}`,
      producto,
      { headers: this.getHeaders() }
    );
  }

  desactivarProducto(id: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiBase}/desactivar/${id}`,
      {},
      { headers: this.getHeaders() }
    );
  }
}