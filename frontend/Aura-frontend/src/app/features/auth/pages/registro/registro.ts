import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { contrasenaCoincide } from '../../../../shared/utils/contraseñasCoinciden';
import { Footer } from '../../../../layouts/footer/footer';
import { Navbar } from '../../../../layouts/navbar/navbar';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, Footer, Navbar],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro implements OnInit {
  // ------------------------------- PROPIEDADES --------------------------------
  cargando = false;
  intentoEnvio = false;
  mensajeError = '';
  mensajeExito = '';
  mostrarContrasena = false;
  mostrarRepetir = false;
  imagenSeleccionada = signal<File | null>(null);
  imagenPreview = signal<string | null>(null);
  form!: FormGroup;

  private readonly apiUrl = 'https://progra-iv-tp-2-casado-santino.vercel.app/auth/registro';

  // ------------------------------- CONSTRUCTOR & CICLO DE VIDA --------------------------------
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        nombre: ['', [Validators.required, Validators.maxLength(15), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/)]],
        apellido: ['', [Validators.required, Validators.maxLength(15), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/)]],
        usuario: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
        correo: ['', [Validators.required, Validators.email]],
        contrasena: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
        repetirContrasena: ['', [Validators.required, Validators.maxLength(20)]],
        fechaNacimiento: ['', [Validators.required]],
        descripcion: ['', [Validators.required, Validators.maxLength(200)]],
      },
      { validators: contrasenaCoincide },
    );
  }

  // ------------------------------- GETTERS --------------------------------
  get f() { return this.form.controls; }  // Atajo para acceder a los controles del formulario en la plantilla

  // ------------------------------- MÉTODOS --------------------------------

  // Alterna la visibilidad de la contraseña
  alternarContrasena(): void { this.mostrarContrasena = !this.mostrarContrasena; }

  // Alterna la visibilidad del campo repetir contraseña
  alternarRepetir(): void { this.mostrarRepetir = !this.mostrarRepetir; }           

  // Maneja el cambio de imagen, guardando el archivo seleccionado y generando una vista previa
  onImagenChange(event: Event): void {
    const input = event.target as HTMLInputElement; // Asegura que el target sea un input de tipo file
    const archivo = input.files?.[0] ?? null;       // Toma el primer archivo seleccionado o null si no hay archivos
    this.imagenSeleccionada.set(archivo);           // Guarda el archivo seleccionado en la propiedad imagenSeleccionada

    // Si se seleccionó un archivo, genera una vista previa usando FileReader
    if (archivo) {
      const reader = new FileReader();
      reader.onload = (e) => this.imagenPreview.set(e.target?.result as string);
      reader.readAsDataURL(archivo);
    } else {
      this.imagenPreview.set(null);  // Si no hay archivo seleccionado, limpia la vista previa
    }
  }

  // Envía el formulario de registro al backend, manejando la respuesta y mostrando mensajes de éxito o error
  enviar(): void {
    this.intentoEnvio = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando = true;

    /*
    FormData se utiliza para enviar datos que incluyen archivos (como la imagen de perfil) al backend. 
    Permite enviar tanto campos de texto como archivos en una sola petición multipart/form-data.
    */
    const fd = new FormData(); 
    const v = this.form.value;  // Se guarda el valor del formulario en una variable para facilitar su uso al agregar los campos al FormData. Se accede a cada campo del formulario a través de v.nombre, v.apellido, etc., y se agregan al FormData con el método append. Para los campos de texto, se utiliza trim() para eliminar espacios en blanco al inicio y al final. Para la imagen, se verifica si hay un archivo seleccionado antes de agregarlo al FormData.
    fd.append('nombre', v.nombre.trim());
    fd.append('apellido', v.apellido.trim());
    fd.append('usuario', v.usuario.trim());
    fd.append('correo', v.correo.trim());
    fd.append('contrasena', v.contrasena);
    fd.append('repetirContrasena', v.repetirContrasena);
    fd.append('fechaNacimiento', v.fechaNacimiento);
    fd.append('descripcion', v.descripcion.trim());
    if (this.imagenSeleccionada()) {
      fd.append('imagen', this.imagenSeleccionada()!);
    }

    this.http
      .post<{ mensaje: string }>(this.apiUrl, fd)
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (res) => {
          this.mensajeExito = res.mensaje;
          setTimeout(() => this.router.navigateByUrl('/log-in'), 1800);
        },
        error: (err) => {
          this.mensajeError =
            err?.error?.message?.[0] ??
            err?.error?.message ??
            'No se pudo completar el registro.';
        },
      });
  }
}
