import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { PublicacionesService } from '../../core/services/publicaciones/publicaciones.service';
import { Navbar } from '../../layouts/navbar/navbar';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, Navbar],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})

export class MiPerfil implements OnInit {
  usuario: any = null;  //  el usuario completo obtenido del localStorage
  publicaciones: any[] = [];  // ultimas 3 publicaciones del usuario
  cargando = true;
  cargandoPublicaciones = true;
  mensajeError = '';

  constructor(
    private authService: AuthService,
    private publicacionesService: PublicacionesService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Obtiene el usuario del localStorage
    this.usuario = this.authService.obtenerUsuario();

    if (!this.usuario) {
      // Si no hay usuario guardado redirige al login
      this.router.navigateByUrl('/login');
      return;
    }

    this.cargando = false;
    this.cargarPublicaciones();
  }

  cargarPublicaciones(): void {
    this.cargandoPublicaciones = true;

    // Trae las ultimas 3 publicaciones del usuario logueado
    this.publicacionesService.listar({
      limit: 3,   // siempre trae las ultimas 3 publicaciones
      offset: 0, // offset 0 para traer desde el inicio, ya que el backend ordena por fecha descendente
      orden: 'fecha',
      usuarioId: this.usuario._id,
    }).subscribe({
      next: (data) => {
        this.publicaciones = data;
        this.cargandoPublicaciones = false;
      },
      error: () => {
        this.mensajeError = 'No se pudieron cargar las publicaciones.';
        this.cargandoPublicaciones = false;
      }
    });
  }

  // Devuelve las iniciales del usuario para el avatar si no tiene imagen
  obtenerIniciales(): string {
    const n = this.usuario?.nombre?.[0] ?? '';  // primera letra del nombre
    const a = this.usuario?.apellido?.[0] ?? '';  // primera letra del apellido
    return (n + a).toUpperCase();
  }

  // Formatea la fecha de nacimiento para mostrarla
  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
  }
}