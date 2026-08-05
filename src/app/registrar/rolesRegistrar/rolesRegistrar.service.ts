import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Roles } from '../../../app/models/registrar.model';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private apiUrl = `${environment.apiUrl}/api/rol/roles`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getRoles(): Observable<ApiResponse<Roles[]>> {
    return this.http.get<ApiResponse<Roles[]>>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }
}