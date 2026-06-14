import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
  cargando = false;
  intentoEnvio = false;
  mensajeError = '';
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
    this.mensajeError = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando = true;

    const payload = {
      usuario: (this.form.value.usuario ?? '').trim(),
      contrasena: this.form.value.contrasena ?? '',
    };

    this.authService.login(payload)
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: () => this.router.navigateByUrl('/publicaciones'),
        error: (error) => {
          this.mensajeError =
            error?.error?.message?.[0] ??
            error?.error?.message ??
            'No se pudo iniciar sesión.';
        },
      });
  }
}