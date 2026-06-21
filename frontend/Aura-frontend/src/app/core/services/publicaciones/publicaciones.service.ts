import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PublicacionesService {
  private readonly apiUrl = `${environment.apiUrl}/publicaciones`;

  constructor(private http: HttpClient) {}

  // Listar publicaciones con filtros opcionales
  listar(params: {
    offset?: number;
    limit?: number;
    orden?: 'fecha' | 'likes';
    usuarioId?: string;
  }): Observable<any[]> {
    let httpParams = new HttpParams();
    if (params.offset !== undefined) httpParams = httpParams.set('offset', params.offset);
    if (params.limit !== undefined) httpParams = httpParams.set('limit', params.limit);
    if (params.orden) httpParams = httpParams.set('orden', params.orden);
    if (params.usuarioId) httpParams = httpParams.set('usuarioId', params.usuarioId);

    return this.http.get<any[]>(this.apiUrl, { params: httpParams });
  }

  // Crear publicación con imagen opcional
  crear(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  // Baja lógica
  eliminar(id: string, usuarioId: string, perfil: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      body: { usuarioId, perfil }
    });
  }

  // Dar like
  darLike(id: string, usuarioId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/like`, { usuarioId });
  }

  // Quitar like
  quitarLike(id: string, usuarioId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/like`, {
      body: { usuarioId }
    });
  }

  // Obtener publicación por ID
  obtenerPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}