import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private readonly apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  // Listar todos los usuarios (GET /usuarios)
  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Crear un nuevo usuario (POST /usuarios)
  crear(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  // Baja lógica de un usuario (DELETE /usuarios/:id)
  deshabilitar(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Alta lógica de un usuario (POST /usuarios/:id/habilitar)
  habilitar(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/habilitar`, {});
  }
}