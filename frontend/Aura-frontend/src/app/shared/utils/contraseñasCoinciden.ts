import { AbstractControl, ValidationErrors } from '@angular/forms';

// Validador personalizado para verificar que las contraseñas coincidan
export function contrasenaCoincide(group: AbstractControl): ValidationErrors | null {
  const c = group.get('contrasena')?.value;
  const r = group.get('repetirContrasena')?.value;
  return c && r && c !== r ? { noCoincide: true } : null;
}