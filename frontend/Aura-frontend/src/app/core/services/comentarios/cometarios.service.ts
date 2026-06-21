
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComentariosService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // --------------------- LISTAR COMENTARIOS ---------------------
  listar(publicacionId: string, offset = 0, limit = 5): Observable<any[]> {
    const params = new HttpParams()
      .set('offset', offset)  // Establece el parámetro de desplazamiento
      .set('limit', limit);   // Establece el parámetro de límite
    return this.http.get<any[]>(`${this.apiUrl}/publicaciones/${publicacionId}/comentarios`, { params }); // Realiza la solicitud GET con los parámetros de consulta
  }

  // --------------------- AGREGAR COMENTARIO ---------------------
  crear(publicacionId: string, mensaje: string, usuarioId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/publicaciones/${publicacionId}/comentarios`, { mensaje, usuarioId });
  }

  // --------------------- MODIFICAR COMENTARIO ---------------------
  actualizar(publicacionId: string, comentarioId: string, mensaje: string, usuarioId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/publicaciones/${publicacionId}/comentarios/${comentarioId}`, { mensaje, usuarioId });
  }
}