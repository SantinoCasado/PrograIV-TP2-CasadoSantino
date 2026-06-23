import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth/auth.service';
import { SesionModal } from './shared/components/sesion-modal/sesion-modal';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SesionModal],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(public authService: AuthService) {} //Inyect del AuthService para usar la señal en el template

  // Funcion para extender la sesión
  extenderSesion(): void {
    this.authService.refrescar().subscribe({
      next: (res) => {
        console.log('Token refrescado:', res);
        this.authService.mostrarModalSesion.set(false);
        this.authService.iniciarContadorSesion(); // reinicia el contador
      },
      error: (err) => {
        console.error('Error al refrescar:', err);
        this.authService.cerrarSesion();
      }
    });
  }

  // Funcion para cerrar la sesión
  cerrarSesion(): void {
    this.authService.mostrarModalSesion.set(false);
    this.authService.cerrarSesion();
  }
}