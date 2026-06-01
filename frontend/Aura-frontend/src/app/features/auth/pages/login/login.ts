import { Component } from '@angular/core';
import { CinematicLoginBackground } from '../../../../shared/components/cinta-pelicula-fondo/cinta-pelicula-fondo';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CinematicLoginBackground],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {}
