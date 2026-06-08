import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly STORAGE_KEY = 'aura_usuario'; // clave para localStorage

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(payload: { usuario: string; contrasena: string }) {
    return this.http.post<{ mensaje: string; usuario: any }>(`${this.apiUrl}/login`, payload).pipe(
      tap(respuesta => {
        // Guardado del usuario completo en localStorage al hacer login
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(respuesta.usuario));
      })
    );
  }

  // Devuelve el usuario guardado en localStorage
  obtenerUsuario(): any {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  // Devuelve el ID del usuario logueado
  obtenerUsuarioId(): string | null {
    return this.obtenerUsuario()?._id ?? null;
  }

  // Devuelve el perfil (usuario/administrador)
  obtenerPerfil(): string {
    return this.obtenerUsuario()?.perfil ?? 'usuario';
  }

  // Verifica si hay un usuario logueado
  estaLogueado(): boolean {
    return !!localStorage.getItem(this.STORAGE_KEY);
  }

  // Cierra sesión
  cerrarSesion(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.router.navigateByUrl('/login');
  }
}