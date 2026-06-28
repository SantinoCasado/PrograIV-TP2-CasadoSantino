import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Navbar } from '../../layouts/navbar/navbar';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule, Navbar],
  templateUrl: './error.html',
  styleUrl: './error.css',
})
export class Error implements OnInit {
  private code: number = 404;
  private message: string = 'Página no encontrada';
  private description: string = 'La página que buscas no existe o ha sido eliminada.';

  constructor(private router: Router) {}

  get errorCode(): number {
    return this.code;
  }

  get errorMessage(): string {
    return this.message;
  }

  get errorDescription(): string {
    return this.description;
  }

  ngOnInit(): void {
    // Obtiene el código de error de los parámetros de navegación si está disponible
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state && navigation.extras['state']['errorCode']) {
      this.code = navigation.extras['state']['errorCode'];
      this.message = navigation.extras['state']['errorMessage'] || 'Error';
      this.description = navigation.extras['state']['errorDescription'] || '';
    }
  }

  volverAtras(): void {
    this.router.navigateByUrl('/publicaciones');
  }

  irAlInicio(): void {
    this.router.navigateByUrl('/');
  }
}

