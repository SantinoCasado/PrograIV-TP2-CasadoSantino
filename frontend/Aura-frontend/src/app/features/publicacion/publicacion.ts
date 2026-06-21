import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth/auth.service';
import { PublicacionesService } from '../../core/services/publicaciones/publicaciones.service';
import { ComentariosService } from '../../core/services/comentarios/cometarios.service';
import { Navbar } from '../../layouts/navbar/navbar';

@Component({
  selector: 'app-publicacion',
  standalone: true,
  imports: [CommonModule, Navbar, ReactiveFormsModule],
  templateUrl: './publicacion.html',
  styleUrl: './publicacion.css',
})
export class Publicacion implements OnInit {
  usuario: any = null;
  publicacion = signal<any>(null);
  comentarios = signal<any[]>([]);
  cargando = signal(true);
  cargandoComentarios = signal(false);
  enviandoComentario = signal(false);
  mensajeError = signal('');
  hayMas = signal(true);
  offset = 0;
  limit = 5;

  // Edición de comentarios
  comentarioEditandoId = signal<string | null>(null); 
  formComentario!: FormGroup;
  formEdicion!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private publicacionesService: PublicacionesService,
    private comentariosService: ComentariosService,
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.obtenerUsuario();
    
    this.formComentario = this.fb.group({
      mensaje: ['', [Validators.required, Validators.maxLength(300)]],
    }); // Validación del formulario de comentario

    this.formEdicion = this.fb.group({
      mensaje: ['', [Validators.required, Validators.maxLength(300)]],
    }); // Validación del formulario de edición de comentario

    const id = this.route.snapshot.paramMap.get('id');  // Obiene el ID de la publicación desde la ruta
    // Si no hay ID, redirige a la lista de publicaciones
    if (!id) {
      this.router.navigateByUrl('/publicaciones');
      return;
    }

    this.cargarPublicacion(id);
    this.cargarComentarios(id);
  }

  cargarPublicacion(id: string): void {
    // Llama al servicio para obtener la publicación por ID
    this.publicacionesService.obtenerPorId(id).subscribe({
      next: (pub) => {
        this.publicacion.set(pub);
        this.cargando.set(false);
      },
      error: () => {
        this.mensajeError.set('No se pudo cargar la publicación.');
        this.cargando.set(false);
      }
    });
  }

  // Carga los comentarios de la publicación actual con paginación
  cargarComentarios(id?: string, reiniciar = false): void {
    const publicacionId = id ?? this.publicacion()?._id;  // Si no se pasa un ID, usa el de la publicación actual
    if (!publicacionId) return; // Si no hay publicación, no hace nada

    if (reiniciar) {  // Reinicia la lista de comentarios y la paginación
      this.comentarios.set([]);
      this.offset = 0;
      this.hayMas.set(true);
    }

    this.cargandoComentarios.set(true); // Indica que estamos cargando comentarios

    this.comentariosService.listar(publicacionId, this.offset, this.limit).subscribe({  // Llama al servicio para listar comentarios
      next: (data) => {
        this.comentarios.update(prev => [...prev, ...data]);  // Agrega los nuevos comentarios al final de la lista
        this.hayMas.set(data.length === this.limit);  // Si la cantidad de comentarios obtenidos es igual al límite, hay más comentarios para cargar
        this.offset += data.length; // Actualiza el offset para la siguiente carga
        this.cargandoComentarios.set(false);  // Indica que ya no estamos cargando comentarios
      },
      error: () => {
        this.mensajeError.set('No se pudieron cargar los comentarios.');
        this.cargandoComentarios.set(false);
      }
    });
  }

  // Función para enviar un nuevo comentario
  enviarComentario(): void {
    if (this.formComentario.invalid) {  // Si el formulario es inválido, marca todos los campos como tocados para mostrar errores
      this.formComentario.markAllAsTouched();
      return;
    }

    this.enviandoComentario.set(true);
    const publicacionId = this.publicacion()?._id;  // Obtiene el ID de la publicación actual

    this.comentariosService.crear(
      publicacionId,
      this.formComentario.value.mensaje.trim(),
      this.usuario._id
    ).subscribe({
      next: (nuevo) => {
        // Agrega el nuevo comentario al principio
        this.comentarios.update(prev => [{ ...nuevo, usuario: this.usuario }, ...prev]);  // Agrega el nuevo comentario al principio de la lista, con el usuario actual como autor
        this.formComentario.reset();
        this.enviandoComentario.set(false);
      },
      error: () => {
        this.mensajeError.set('No se pudo enviar el comentario.');
        this.enviandoComentario.set(false);
      }
    });
  }

  // ------------ LOGICA DE COMENTARIOS POR ESTADOS ------------------------------

  // Funciones para editar comentarios
  iniciarEdicion(comentario: any): void {
    this.comentarioEditandoId.set(comentario._id);  // Indica que este comentario está en edición
    this.formEdicion.patchValue({ mensaje: comentario.mensaje });
  }

  // Cancela la edición de un comentario
  cancelarEdicion(): void {
    this.comentarioEditandoId.set(null);  // Indica que no hay ningún comentario en edición
    this.formEdicion.reset();
  }

  // Guarda la edición de un comentario
  guardarEdicion(comentario: any): void {
    if (this.formEdicion.invalid) {
      this.formEdicion.markAllAsTouched();
      return;
    }

    this.comentariosService.actualizar(
      this.publicacion()?._id,
      comentario._id,
      this.formEdicion.value.mensaje.trim(),
      this.usuario._id
    ).subscribe({
      next: (actualizado) => {
        this.comentarios.update(prev => // Actualiza el comentario en la lista de comentarios
          prev.map(c => c._id === comentario._id
            ? { ...actualizado, usuario: comentario.usuario }
            : c
          )
        );
        this.cancelarEdicion();
      },
      error: () => this.mensajeError.set('No se pudo editar el comentario.')
    });
  }

  // Verifica si el usuario actual es el autor del comentario
  esAutorComentario(comentario: any): boolean {
    return comentario.usuario?._id === this.usuario._id;
  }

  // Funciones para dar y quitar like a la publicación
  yaLikeo(): boolean {
    return this.publicacion()?.likes?.some((id: string) => id === this.usuario._id);
  }

  // Alterna el like de la publicación dependiendo de si el usuario ya le dio like o no
  toggleLike(): void {
    const pub = this.publicacion();
    const accion = this.yaLikeo()
      ? this.publicacionesService.quitarLike(pub._id, this.usuario._id)
      : this.publicacionesService.darLike(pub._id, this.usuario._id);

    accion.subscribe({
      next: (pubActualizada) => {
        this.publicacion.set({ ...pubActualizada, usuario: pub.usuario });
      },
      error: () => this.mensajeError.set('No se pudo procesar el like.')
    });
  }

  // Función para formatear la fecha de los comentarios y publicaciones en un formato relativo (hace X minutos, hace X horas, etc.)
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