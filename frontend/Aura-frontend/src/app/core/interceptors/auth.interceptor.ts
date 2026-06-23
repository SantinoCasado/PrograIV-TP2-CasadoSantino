import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) { // Si el error es 401 (no autorizado)
        authService.limpiarContador();  // Limpiar el contador de sesión
        authService.cerrarSesion();     // Cerrar la sesión del usuario
        router.navigateByUrl('/log-in');    // Redirigir al usuario a la página de inicio de sesión
      }
      return throwError(() => error);
    })
  );
};