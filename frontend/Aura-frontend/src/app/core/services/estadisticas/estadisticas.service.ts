import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {
  private readonly apiUrl = `${environment.apiUrl}/estadisticas`;

  constructor(private http: HttpClient) {}

  // Obtener la cantidad de publicaciones por usuario en un lapso de tiempo (GET /estadisticas/publicaciones-por-usuario?desde=YYYY-MM-DD&hasta=YYYY-MM-DD)
  publicacionesPorUsuario(desde: string, hasta: string): Observable<any[]> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<any[]>(`${this.apiUrl}/publicaciones-por-usuario`, { params });
  }

  // Obtener la cantidad de comentarios por día en un lapso de tiempo (GET /estadisticas/comentarios-por-lapso?desde=YYYY-MM-DD&hasta=YYYY-MM-DD)
  comentariosPorLapso(desde: string, hasta: string): Observable<any[]> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<any[]>(`${this.apiUrl}/comentarios-por-lapso`, { params });
  }

  // Obtener la cantidad de comentarios por publicación en un lapso de tiempo (GET /estadisticas/comentarios-por-publicacion?desde=YYYY-MM-DD&hasta=YYYY-MM-DD)
  comentariosPorPublicacion(desde: string, hasta: string): Observable<any[]> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<any[]>(`${this.apiUrl}/comentarios-por-publicacion`, { params });
  }
}