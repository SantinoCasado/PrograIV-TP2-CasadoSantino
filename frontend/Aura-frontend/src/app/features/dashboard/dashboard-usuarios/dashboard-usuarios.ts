import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Navbar } from '../../../layouts/navbar/navbar';
import { UsuariosService } from '../../../core/services/usuarios/usuario.service';
import { ConfirmarModal } from '../../../shared/components/confirmar-modal/confirmar-modal';
import { InicialesPipe } from '../../../shared/pipes/iniciales.pipe';
import { TruncarPipe } from '../../../shared/pipes/truncar.pipe';
import { HighlightAdminDirective } from '../../../shared/directivas/highlight-admin.directive';
@Component({
  selector: 'app-dashboard-usuarios',
  standalone: true,
  imports: [CommonModule, Navbar, ReactiveFormsModule, ConfirmarModal, InicialesPipe, TruncarPipe, HighlightAdminDirective],
  templateUrl: './dashboard-usuarios.html',
  styleUrl: './dashboard-usuarios.css',
})
export class DashboardUsuarios implements OnInit {
  //---------- Estados de la escena ----------
  usuarios = signal<any[]>([]);
  cargando = signal(true);
  mensajeError = signal('');
  mensajeExito = signal('');
  mostrarFormulario = signal(false);
  enviando = signal(false);
  mostrarConfirmar = signal(false);
  usuarioADeshabilitar: any = null;
  imagenFile: File | null = null;
  intentoEnvio = false;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      usuario: ['', Validators.required],
      contrasena: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/),
      ]],
      repetirContrasena: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      descripcion: ['', Validators.required],
      perfil: ['usuario', Validators.required], // radio buttons
    });

    this.cargarUsuarios();
  }

  // --------- Funciones de la escena ----------
  cargarUsuarios(): void {
    this.cargando.set(true);
    this.usuariosService.listar().subscribe({
      next: (data) => {
        this.usuarios.set(data);  // Actualizamos la señal con los usuarios obtenidos
        this.cargando.set(false); // Desactivamos el indicador de carga
      },
      error: () => {
        this.mensajeError.set('No se pudieron cargar los usuarios.');
        this.cargando.set(false);
      }
    });
  }

  // --------- Funciones del formulario ----------
  onImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.imagenFile = input.files?.[0] ?? null;
  }

  // --------- Funciones de creación de usuario ----------
  crearUsuario(): void {
    this.intentoEnvio = true;
    this.mensajeError.set('');

    // Validación del formulario
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Validación de contraseñas
    if (this.form.value.contrasena !== this.form.value.repetirContrasena) {
      this.mensajeError.set('Las contraseñas no coinciden.');
      return;
    }

    // Preparación de FormData para enviar al backend
    const formData = new FormData();
    Object.keys(this.form.value).forEach(key => {
      formData.append(key, this.form.value[key]);
    });
    if (this.imagenFile) formData.append('imagen', this.imagenFile);

    this.enviando.set(true);
    this.usuariosService.crear(formData).subscribe({
      next: () => {
        this.mensajeExito.set('Usuario creado correctamente.');
        this.form.reset({ perfil: 'usuario' });
        this.imagenFile = null;
        this.intentoEnvio = false;
        this.mostrarFormulario.set(false);
        this.enviando.set(false);
        setTimeout(() => this.mensajeExito.set(''), 3000);
        this.cargarUsuarios();
      },
      error: (err) => {
        this.mensajeError.set(err?.error?.message ?? 'No se pudo crear el usuario.');
        this.enviando.set(false);
      }
    });
  }
  // --------- Funciones de habilitación/deshabilitación ----------
  abrirConfirmar(usuario: any): void {
    this.usuarioADeshabilitar = usuario;
    this.mostrarConfirmar.set(true);
  }

  confirmarDeshabilitar(): void {
    this.mostrarConfirmar.set(false);
    if (!this.usuarioADeshabilitar) return;

    this.usuariosService.deshabilitar(this.usuarioADeshabilitar._id).subscribe({
      next: () => {
        this.usuarios.update(prev =>
          prev.map(u => u._id === this.usuarioADeshabilitar._id ? { ...u, activa: false } : u)
        );
        this.usuarioADeshabilitar = null;
        this.mensajeExito.set('Usuario deshabilitado.');
        setTimeout(() => this.mensajeExito.set(''), 3000);
      },
      error: (err) => this.mensajeError.set(err?.error?.message ?? 'No se pudo deshabilitar.')
    });
  }

  habilitar(usuario: any): void {
    this.usuariosService.habilitar(usuario._id).subscribe({
      next: () => {
        this.usuarios.update(prev =>
          prev.map(u => u._id === usuario._id ? { ...u, activa: true } : u)
        );
        this.mensajeExito.set('Usuario habilitado.');
        setTimeout(() => this.mensajeExito.set(''), 3000);
      },
      error: (err) => this.mensajeError.set(err?.error?.message ?? 'No se pudo habilitar.')
    });
  }
}