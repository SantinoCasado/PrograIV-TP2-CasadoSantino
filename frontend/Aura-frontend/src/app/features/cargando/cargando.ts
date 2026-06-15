import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-cargando',
  standalone: true,
  templateUrl: './cargando.html',
  styleUrl: './cargando.css',
})
export class Cargando implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const token = this.authService.obtenerToken();  // Obtiene el token del localStorage

    if (!token) {
      this.router.navigateByUrl('/log-in');
      return;
    }

    // Valida el token contra el back
    this.authService.autorizar().subscribe({
      next: () => this.router.navigateByUrl('/publicaciones'),
      error: () => {
        this.authService.cerrarSesion();
        this.router.navigateByUrl('/log-in');
      }
    });
  }
}