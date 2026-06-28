import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(): boolean {
    // Verifica que esté logueado
    if (!this.authService.estaLogueado()) {
      this.router.navigateByUrl('/cargando');
      return false;
    }

    // Verifica que sea administrador
    if (this.authService.esAdmin()) {
      return true;
    } else {
      // Si no es admin, redirige a publicaciones
      this.router.navigateByUrl('/publicaciones');
      return false;
    }
  }
}
