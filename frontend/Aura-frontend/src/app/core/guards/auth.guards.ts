import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate { // Implementa la interfaz CanActivate para proteger rutas que requieren autenticación
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('aura_token');   // Obtiene el token de autenticación almacenado en el localStorage

    if (!token) {
      this.router.navigateByUrl('/cargando');   // Si no hay token, redirige al usuario a la página de carga (o login)
      return false;
    }

    return true;
  }
}