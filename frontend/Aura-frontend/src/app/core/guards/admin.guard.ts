import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('aura_token');

    if (!token) {
      this.router.navigateByUrl('/cargando');
      return false;
    }

    try {
      // Decodifica el token JWT para obtener la información del usuario
        const decoded = JSON.parse(atob(token.split('.')[1]));
        
        // Verifica que el usuario sea administrador
        if (decoded.role === 'admin' || decoded.rol === 'admin') {
            return true;
        } else {
            // Si no es admin, redirige a publicaciones
            this.router.navigateByUrl('/publicaciones');
            return false;
        }
        } catch (error) {
        this.router.navigateByUrl('/cargando');
        return false;
        }
    }
}
