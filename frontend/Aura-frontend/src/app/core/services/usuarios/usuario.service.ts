import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  // Trae todos los datos del usuario por su ID
  obtenerUsuario(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuario/${id}`);
  }
}