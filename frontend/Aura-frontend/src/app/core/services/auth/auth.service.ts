import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, tap, throwError, timeout } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'aura_token';
  private readonly USUARIO_KEY = 'aura_usuario';
  private sessionTimer: any = null;
  mostrarModalSesion = signal(false);

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  // ----------------------- VALIDACIONES DE TOKENS -----------------------
  // Valida el token contra el back, usado en la pantalla de cargando
  autorizar() {
    const token = this.obtenerToken();
    return this.http.post<any>(`${this.apiUrl}/autorizar`, { token });
  }

  // Refresca el token cuando quedan 5 minutos
  refrescar() {
    const token = this.obtenerToken();
    return this.http.post<{ token: string }>(`${this.apiUrl}/refrescar`, { token }).pipe(
      tap(respuesta => {
        localStorage.setItem(this.TOKEN_KEY, respuesta.token);
      })
    );
  }

  // ----------------------- FUNCIONES DE LOGIN -----------------------
  // Realiza el login y guarda el token y usuario en localStorage
  login(payload: { usuario: string; contrasena: string }) {
    return this.http.post<{ token: string; usuario: any }>(`${this.apiUrl}/login`, payload).pipe(
      timeout(3000),
      tap(respuesta => {
        localStorage.setItem(this.TOKEN_KEY, respuesta.token);
        localStorage.setItem(this.USUARIO_KEY, JSON.stringify(respuesta.usuario));
      }),
      catchError((error: HttpErrorResponse | Error) => {
        const mensaje = error instanceof HttpErrorResponse
          ? (error.error?.message?.[0] ?? error.error?.message ?? error.message ?? 'No se pudo iniciar sesión.')
          : (error.message || 'No se pudo iniciar sesión.');

        return throwError(() => new Error(mensaje));
      })
    );
  }

  // ----------------------- FUNCIONES DE SESION -----------------------
  obtenerToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  obtenerUsuario(): any {
    const data = localStorage.getItem(this.USUARIO_KEY);
    return data ? JSON.parse(data) : null;
  }

  obtenerUsuarioId(): string | null {
    return this.obtenerUsuario()?._id ?? null;
  }

  obtenerPerfil(): string {
    return this.obtenerUsuario()?.perfil ?? 'usuario';
  }

  esAdmin(): boolean {
    // Obtiene el perfil en minúsculas para comparación insensible a mayúsculas
    const perfil = this.obtenerPerfil().toLowerCase();
    
    if (perfil === 'admin' || perfil === 'administrador') {
      return true;
    }

    // Si no está en localStorage, decodifica el token JWT
    try {
      const token = this.obtenerToken();
      if (token) {
        const decoded: any = JSON.parse(atob(token.split('.')[1]));
        const role = (decoded.role || decoded.rol || decoded.perfil || '').toLowerCase();
        return role === 'admin' || role === 'administrador';
      }
    } catch (error) {
      console.error('Error decodificando token:', error);
    }

    return false;
  }

  estaLogueado(): boolean {
    return !!this.obtenerToken();
  }

  cerrarSesion(): void {
    this.limpiarContador();
    this.mostrarModalSesion.set(false); 
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USUARIO_KEY);
    this.router.navigateByUrl('/log-in');
  }

  iniciarContadorSesion(): void {
    this.limpiarContador();
    // 10 minutos para que aparezca el modal (token se vence a los 15)
    this.sessionTimer = setTimeout(() => {
      this.mostrarModalSesion.set(true);
    }, 600000);  // 10 minutos = 600000ms
  }

  limpiarContador(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }
}