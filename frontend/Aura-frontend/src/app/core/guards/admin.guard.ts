import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

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
      const decoded: any = jwtDecode(token);
      
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
