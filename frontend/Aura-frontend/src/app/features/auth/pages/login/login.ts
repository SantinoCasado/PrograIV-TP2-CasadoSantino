import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  cargando = false;
  intentoEnvio = false;
  mensajeError = '';
  mensajeExito = '';
  form!: FormGroup;
  
  private readonly apiUrl = 'http://localhost:3000/auth/login';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
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

  enviar(): void {
    this.intentoEnvio = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando = true;

    // Playload que se envía al backend. 
    const payload = {
      usuario: (this.form.value.usuario ?? '').trim(),
      'contraseña': this.form.value.contrasena ?? '',
    };

    // Se hace la petición al backend para iniciar sesión. Se espera un mensaje de éxito y los datos del usuario.
    this.http
        .post<{ mensaje: string; usuario: unknown }>(this.apiUrl, payload)  // El tipo de respuesta esperada del backend. Se espera un mensaje y los datos del usuario. El tipo de usuario se deja como unknown porque no se especificó un modelo de usuario en el frontend.
        .pipe(finalize(() => (this.cargando = false)))  // Se finaliza la carga sin importar el resultado de la petición.
        .subscribe({
          next: (respuesta) => {
            this.mensajeExito = respuesta.mensaje;
            this.router.navigateByUrl('/publicaciones');  // Se redirige a la página de publicaciones después de un inicio de sesión exitoso.
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
