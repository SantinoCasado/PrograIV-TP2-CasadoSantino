import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  mensajeExito = '';
  mostrarContrasena = false;
  form!: FormGroup;

  private readonly apiUrl = 'https://progra-iv-tp-2-casado-santino.vercel.app/auth/login';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      /*
      El input del front solo llama usuario. El usuario puede ingresar tanto su nombre de usuario, o su correo. 
      El front solo exige que no esté vacío. 
      Luego el backend recibe ese valor en usuario y hace la búsqueda por: usuario o correo
      */
      usuario: ['', [Validators.required]], 
      contrasena: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/),
        ],
      ],
    });
  }

  get usuarioControl() {
    return this.form.get('usuario');
  }
  
  get contrasenaControl() {
    return this.form.get('contrasena');
  }

  alternarContrasena(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  enviar(): void {
    this.intentoEnvio = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    // Validación del formulario
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando = true;

    // Preparar payload para login
    const payload = {
      usuario: (this.form.value.usuario ?? '').trim(),
      contrasena: this.form.value.contrasena ?? '',
    };

    // Llamada al servicio de autenticación
    this.authService.login(payload)
      .pipe(finalize(() => (this.cargando = false)))  // Finalize para manejar el estado de carga
      .subscribe({      // Manejo de respuesta exitosa y errores
        next: () => {
          this.router.navigateByUrl('/publicaciones');
        },
        error: (error) => {
          this.mensajeError =
            error?.error?.message?.[0] ??
            error?.error?.message ??
            'No se pudo iniciar sesión.';
        },
      });
  }
}
