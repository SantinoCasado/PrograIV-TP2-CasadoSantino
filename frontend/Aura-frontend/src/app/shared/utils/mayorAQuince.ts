import { AbstractControl, ValidationErrors } from '@angular/forms';

export function edadMinima(minAnios: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const fechaNac = new Date(control.value);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fechaNac.getFullYear();
    const cumplioEsteAnio =
      hoy.getMonth() > fechaNac.getMonth() ||
      (hoy.getMonth() === fechaNac.getMonth() && hoy.getDate() >= fechaNac.getDate());
    const edadReal = cumplioEsteAnio ? edad : edad - 1;
    return edadReal < minAnios ? { menorEdad: true } : null;
  };
}