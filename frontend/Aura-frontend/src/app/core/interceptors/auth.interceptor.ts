import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.obtenerToken();

  // Clona el request agregando el token en el header
  const reqConToken = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })   // Clona la solicitud y agrega el token en el encabezado de autorización
    : req;

  return next(reqConToken).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) { // Si la respuesta es un error 401 (no autorizado)
        authService.limpiarContador();  // Limpia el contador de sesión
        authService.cerrarSesion();     // Cierra la sesión del usuario
        router.navigateByUrl('/log-in');    // Redirige al usuario a la página de inicio de sesión
      }
      return throwError(() => error);
    })
  );
};