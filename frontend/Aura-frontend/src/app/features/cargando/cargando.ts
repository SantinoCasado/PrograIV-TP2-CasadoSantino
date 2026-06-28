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
    const token = this.authService.obtenerToken();
    const timerMinimo = new Promise(resolve => setTimeout(resolve, 2000)); // ✅ mínimo 2 segundos

    if (!token) {
      timerMinimo.then(() => this.router.navigateByUrl('/log-in'));
      return;
    }

    // Espera el timer mínimo Y la validación del token en paralelo
    Promise.all([
      timerMinimo,
      this.authService.autorizar().toPromise()
    ])
      .then(() => this.router.navigateByUrl('/publicaciones'))
      .catch(() => {
        this.authService.cerrarSesion();
        this.router.navigateByUrl('/log-in');
      });
  }
}