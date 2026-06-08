import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { PublicacionesService } from '../../core/services/publicaciones/publicaciones.service';
import { Navbar } from '../../layouts/navbar/navbar';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule, Navbar],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones implements OnInit {
  usuario: any = null;
  publicaciones: any[] = [];
  cargando = true;
  mensajeError = '';

  // Paginación
  offset = 0;
  limit = 10;
  hayMas = true;

  // Ordenamiento
  orden: 'fecha' | 'likes' = 'fecha';

  constructor(
    private authService: AuthService,
    private publicacionesService: PublicacionesService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.obtenerUsuario();

    // Si no hay usuario logueado, redirigimos al login
    if (!this.usuario) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.cargarPublicaciones();
  }

  // Carga las publicaciones con la configuración actual de paginación y ordenamiento
  cargarPublicaciones(reiniciar = false): void {
    if (reiniciar) {  // Si se indica reiniciar, limpia las publicaciones y resetea la paginación
      this.publicaciones = [];
      this.offset = 0;
      this.hayMas = true;
    }

    this.cargando = true;
    this.mensajeError = '';

    this.publicacionesService.listar({
      offset: this.offset,
      limit: this.limit,
      orden: this.orden,
    }).subscribe({
      next: (data) => {
        this.publicaciones = [...this.publicaciones, ...data];
        // Si vino menos de lo pedido, no hay más páginas
        this.hayMas = data.length === this.limit;
        this.offset += data.length;
        this.cargando = false;
      },
      error: () => {
        this.mensajeError = 'No se pudieron cargar las publicaciones.';
        this.cargando = false;
      }
    });
  }

  cargarMas(): void {
    if (!this.cargando && this.hayMas) {
      this.cargarPublicaciones();
    }
  }

  cambiarOrden(nuevoOrden: 'fecha' | 'likes'): void {
    if (this.orden === nuevoOrden) return;
    this.orden = nuevoOrden;
    this.cargarPublicaciones(true);
  }

  // Verifica si el usuario actual ya le dio like a una publicación
  yaLikeo(pub: any): boolean {
    return pub.likes?.some((id: string) => id === this.usuario._id);
  }

  // Alterna el like de una publicación dependiendo de si el usuario ya le dio like o no
  toggleLike(pub: any): void {
    const accion = this.yaLikeo(pub)
      ? this.publicacionesService.quitarLike(pub._id, this.usuario._id) // Si ya le dio like, lo quita
      : this.publicacionesService.darLike(pub._id, this.usuario._id);   // Si no le dio like, lo agrega

    accion.subscribe({
      next: (pubActualizada) => {
        // Reemplaza la publicación actualizada en el array
        const index = this.publicaciones.findIndex(p => p._id === pub._id);
        if (index !== -1) this.publicaciones[index] = pubActualizada;
      },
      error: () => {
        this.mensajeError = 'No se pudo procesar el like.';
      }
    });
  }

  // Elimina una publicación si el usuario es el autor
  eliminarPublicacion(pub: any): void {
    if (!confirm('¿Seguro que querés eliminar esta publicación?')) return;  // Confirmación antes de eliminar

    this.publicacionesService.eliminar(pub._id, this.usuario._id, this.usuario.perfil)
      .subscribe({
        next: () => {
          // La remueve del array local sin recargar todo
          this.publicaciones = this.publicaciones.filter(p => p._id !== pub._id);
        },
        error: () => {
          this.mensajeError = 'No se pudo eliminar la publicación.';
        }
      });
  }

  // Verifica si el usuario actual es el autor de la publicación
  esAutor(pub: any): boolean {
    return pub.usuario?._id === this.usuario._id;
  }

  // Formatea la fecha relativa (hace X minutos/horas/días)
  formatearFechaRelativa(fecha: string): string {
    const diff = Date.now() - new Date(fecha).getTime();
    const minutos = Math.floor(diff / 60000);
    if (minutos < 1) return 'ahora';
    if (minutos < 60) return `hace ${minutos} min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `hace ${horas} h`;
    const dias = Math.floor(horas / 24);
    return `hace ${dias} d`;
  }
}