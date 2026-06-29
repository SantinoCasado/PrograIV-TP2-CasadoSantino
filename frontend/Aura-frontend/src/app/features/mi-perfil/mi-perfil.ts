import { Component, OnInit, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { PublicacionesService } from '../../core/services/publicaciones/publicaciones.service';
import { Navbar } from '../../layouts/navbar/navbar';
import { FechaRelativaPipe } from '../../shared/pipes/fecha-relativa.pipe';
import { InicialesPipe } from '../../shared/pipes/iniciales.pipe';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, Navbar, FechaRelativaPipe, InicialesPipe],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})

export class MiPerfil implements OnInit {
  usuario: any = null;  //  el usuario completo obtenido del localStorage
  publicaciones = signal<any[]>([]);  // ultimas 3 publicaciones del usuario
  cargando = signal(true);
  cargandoPublicaciones = signal(true);
  mensajeError = signal('');

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

    this.cargando.set(false);
    this.cargarPublicaciones();
  }

  cargarPublicaciones(): void {
    this.cargandoPublicaciones.set(true);

    // Trae las ultimas 3 publicaciones del usuario logueado
    this.publicacionesService.listar({
      limit: 3,   // siempre trae las ultimas 3 publicaciones
      offset: 0, // offset 0 para traer desde el inicio, ya que el backend ordena por fecha descendente
      orden: 'fecha',
      usuarioId: this.usuario._id,
    }).subscribe({
      next: (data) => {
        this.publicaciones.set(data);
        this.cargandoPublicaciones.set(false);
      },
      error: () => {
        this.mensajeError.set('No se pudieron cargar las publicaciones.');
        this.cargandoPublicaciones.set(false);
      }
    });
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
  }
}