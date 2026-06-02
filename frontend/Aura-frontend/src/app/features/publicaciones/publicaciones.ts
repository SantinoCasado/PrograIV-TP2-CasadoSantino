import { Component } from '@angular/core';
import { Navbar } from "../../layouts/navbar/navbar";

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [Navbar],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones {}
