import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from "../../layouts/navbar/navbar";
@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [Navbar],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil {}
