import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sesion-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sesion-modal.html',
  styleUrl: './sesion-modal.css',
})
export class SesionModal {
  @Output() extenderSesion = new EventEmitter<void>();
  @Output() cerrarSesion = new EventEmitter<void>();
}
