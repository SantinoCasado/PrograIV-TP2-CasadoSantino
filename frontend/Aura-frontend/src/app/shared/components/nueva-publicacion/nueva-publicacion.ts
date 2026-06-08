import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { PublicacionesService } from '../../../core/services/publicaciones/publicaciones.service';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-nueva-publicacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nueva-publicacion.html',
  styleUrl: './nueva-publicacion.css',
})

export class NuevaPublicacion {
  @Output() publicacionCreada = new EventEmitter<any>(); // emite la nueva publicación al padre
  @Output() cerrar = new EventEmitter<void>();           // emite cuando se cierra el modal

  form!: FormGroup;
  cargando = signal(false);
  mensajeError = signal('');
  imagenPreview = signal<string | null>(null); // preview de la imagen seleccionada
  imagenFile: File | null = null;
  intentoEnvio = false;

  constructor(
    private fb: FormBuilder,
    private publicacionesService: PublicacionesService,
    private authService: AuthService,
  ) {
    this.form = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(70)]],
      mensaje: ['', [Validators.required, Validators.maxLength(500)]],
    });
  }

  get tituloControl() { return this.form.get('titulo') as FormControl; }
  get mensajeControl() { return this.form.get('mensaje') as FormControl; }

  // Manejo la selección de imagen, validando el tipo y generando un preview local
  onImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement; // obtengo el input de tipo file
    const file = input.files?.[0];  // tomo el primer archivo seleccionado (si hay)

    if (!file) return;  // si no se seleccionó ningún archivo, simplemente retorno sin hacer nada

    // Validación del tipo de archivo: solo permite imágenes JPEG, PNG o WEBP. Si el archivo seleccionado no es de un tipo permitido, muestra un mensaje de error y no se procesa la imagen.
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.mensajeError.set('Solo se permiten imágenes JPG, PNG o WEBP.');
      return;
    }

    this.imagenFile = file;
    // Genero preview local sin subir nada todavía
    const reader = new FileReader();
    reader.onload = (e) => this.imagenPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
    this.mensajeError.set('');
  }

  eliminarImagen(): void {
    this.imagenFile = null;
    this.imagenPreview.set(null);
  }

  enviar(): void {
    this.intentoEnvio = true;
    this.mensajeError.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const usuarioId = this.authService.obtenerUsuarioId();
    if (!usuarioId) return;

    // Armamos el FormData para enviar texto e imagen juntos
    const formData = new FormData();
    formData.append('titulo', this.form.value.titulo.trim());
    formData.append('mensaje', this.form.value.mensaje.trim());
    formData.append('usuarioId', usuarioId);
    if (this.imagenFile) {
      formData.append('imagen', this.imagenFile);
    }

    this.cargando.set(true);

    this.publicacionesService.crear(formData).subscribe({
      next: (nueva) => {
        this.cargando.set(false);
        this.publicacionCreada.emit(nueva); // notifica al padre con la nueva publicación
        this.cerrarForm();
      },
      error: (error) => {
        this.mensajeError.set(
          error?.error?.message?.[0] ??
          error?.error?.message ??
          'No se pudo crear la publicación.'
        );
        this.cargando.set(false);
      }
    });
  }

  cerrarForm(): void {
    this.form.reset();
    this.imagenFile = null;
    this.imagenPreview.set(null);
    this.intentoEnvio = false;
    this.mensajeError.set('');
    this.cerrar.emit();
  }
}