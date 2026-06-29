import { Component, OnInit, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { PublicacionesService } from '../../core/services/publicaciones/publicaciones.service';
import { Navbar } from '../../layouts/navbar/navbar';
import { NuevaPublicacion } from '../../shared/components/nueva-publicacion/nueva-publicacion';
import { ConfirmarModal } from '../../shared/components/confirmar-modal/confirmar-modal';
import { FechaRelativaPipe } from '../../shared/pipes/fecha-relativa.pipe';
import { TruncarPipe } from '../../shared/pipes/truncar.pipe';
@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule, Navbar, NuevaPublicacion, ConfirmarModal,  FechaRelativaPipe, TruncarPipe],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones implements OnInit {
  usuario: any = null;
  publicaciones = signal<any[]>([]);
  cargando = signal(true);
  mensajeError = signal('');
  mostrarModal = signal(false); //Formulario de nueva publicación modal
  mostrarConfirmar = signal(false);
  publicacionAEliminar: any = null;

  // Paginación
  offset = 0;
  limit = 10;
  hayMas = signal(true);

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
    if (reiniciar) {
      this.publicaciones.set([]);
      this.offset = 0;
      this.hayMas.set(true);
    }

    this.cargando.set(true);
    this.mensajeError.set('');

    this.publicacionesService.listar({
      offset: this.offset,
      limit: this.limit,
      orden: this.orden,
    }).subscribe({
      next: (data) => {
        // Creo nuevos objetos para forzar la detección de cambios
        const nuevas = data.map((p: any) => ({ ...p }));
        this.publicaciones.update(prev => [...prev, ...nuevas]);
        this.hayMas.set(data.length === this.limit);
        this.offset += data.length;
        this.cargando.set(false);
      },
      error: () => {
        this.mostrarError('No se pudieron cargar las publicaciones.');
        this.cargando.set(false);
      }
    });
  }


  cargarMas(): void {
    if (!this.cargando() && this.hayMas()) {
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
      ? this.publicacionesService.quitarLike(pub._id, this.usuario._id)
      : this.publicacionesService.darLike(pub._id, this.usuario._id);

    // Actualiza la publicación localmente con el resultado de la acción sin recargar todo
    accion.subscribe({
      next: (pubActualizada) => {
        this.publicaciones.update(prev =>
          prev.map(p => p._id === pub._id ? { ...pubActualizada, usuario: pub.usuario } : p)  // Mantengo el usuario original para no perder la referencia
        );
      },
      error: () => this.mostrarError('No se pudo procesar el like.')
    });
  }

  // -------------- Funciones para el manejo de eliminar publicaciones -----------------
  abrirConfirmar(pub: any): void {
    this.publicacionAEliminar = pub;
    this.mostrarConfirmar.set(true);
  }

  confirmarEliminar(): void {
    this.mostrarConfirmar.set(false);
    if (!this.publicacionAEliminar) return;

    this.publicacionesService.eliminar(
      this.publicacionAEliminar._id,
      this.usuario._id,
      this.usuario.perfil
    ).subscribe({
      next: () => {
        this.publicaciones.update(prev =>
          prev.filter(p => p._id !== this.publicacionAEliminar._id)
        );
        this.publicacionAEliminar = null;
      },
      error: () => this.mostrarError('No se pudo eliminar la publicación.')
    });
  }
  
  // --------------------- Funciones aleternativas ----------------------

  // Verifica si el usuario actual es el autor de la publicación
  esAutor(pub: any): boolean {
    return pub.usuario?._id === this.usuario._id;
  }

  abrirModal(): void {
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
  }
  
  verPublicacion(id: string): void {
    this.router.navigateByUrl(`/publicaciones/${id}`);
  }

  agregarNuevaPublicacion(nueva: any): void {
    // Inyectamos el usuario logueado en la nueva publicación para que el template lo muestre
    const pubConUsuario = {
      ...nueva,
      usuario: this.authService.obtenerUsuario()
    };
    this.publicaciones.update(prev => [pubConUsuario, ...prev]);
  }

  private mostrarError(mensaje: string): void {
    this.mensajeError.set(mensaje);
    setTimeout(() => this.mensajeError.set(''), 3000); // desaparece en 3 segundos
  }
}