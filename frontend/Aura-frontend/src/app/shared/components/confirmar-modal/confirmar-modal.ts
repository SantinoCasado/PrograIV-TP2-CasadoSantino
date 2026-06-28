import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmar-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmar-modal.html',
  styleUrl: './confirmar-modal.css',
})
export class ConfirmarModal {
  @Input() mensaje = '¿Estás seguro?';
  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
}