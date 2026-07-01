import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Footer } from "../../../../layouts/footer/footer";
import { Navbar } from "../../../../layouts/navbar/navbar";
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, Footer, Navbar],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  cargando = signal(false); 
  mensajeError = signal('');
  intentoEnvio = false;
  mostrarContrasena = false;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      usuario: ['', [Validators.required]],
      contrasena: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/),
      ]],
    });
  }

  get usuarioControl() { return this.form.get('usuario'); }
  get contrasenaControl() { return this.form.get('contrasena'); }

  alternarContrasena(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  enviar(): void {
    this.intentoEnvio = true;
    this.mensajeError.set(''); // Limpia errores previos

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true); // El botón pasa a "Ingresando..."

    const payload = {
      usuario: (this.form.value.usuario ?? '').trim(),
      contrasena: this.form.value.contrasena ?? '',
    };

    const fallbackTimer = window.setTimeout(() => {
      if (this.cargando()) {
        this.cargando.set(false);
        this.mensajeError.set('No se pudo iniciar sesión. Verificá tu conexión e intentá nuevamente.');
      }
    }, 5000);

    this.authService.login(payload)
      .pipe(finalize(() => {
        this.cargando.set(false);
        window.clearTimeout(fallbackTimer);
      }))
      .subscribe({
        next: () => {
          this.authService.iniciarContadorSesion();
          this.router.navigateByUrl('/publicaciones');
        },
        error: (error) => {
          this.mensajeError.set(this.obtenerMensajeError(error));
        },
      });
  }

  private obtenerMensajeError(error: unknown): string {
    let mensajeBase = 'No se pudo iniciar sesión.';

    // 1. Si es un string directo (lo que manda el nuevo service corregido)
    if (typeof error === 'string') {
      mensajeBase = error;
    } 
    // 2. Si es una instancia de Error nativa
    else if (error instanceof Error) {
      mensajeBase = error.message;
    } 
    // 3. Si es un objeto genérico (HttpErrorResponse o similar)
    else if (error && typeof error === 'object') {
      mensajeBase = (error as any).error?.message || (error as any).message || mensajeBase;
    }

    // Si por alguna razón el mensaje sigue siendo un objeto o array, lo forzamos a string
    if (typeof mensajeBase !== 'string') {
      mensajeBase = String(mensajeBase);
    }

    // Interceptamos para poner tu lindo cartel personalizado
    if (/deshabilit|banead/i.test(mensajeBase)) {
      return 'Tu cuenta ha sido deshabilitada. Contacta al administrador.';
    }

    return mensajeBase;
  }
}