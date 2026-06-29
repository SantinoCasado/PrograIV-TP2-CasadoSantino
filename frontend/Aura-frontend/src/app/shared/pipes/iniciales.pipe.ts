import { Pipe, PipeTransform } from '@angular/core';

/*  Donde fue utilizado el pipe:
dashboard-usuarios.html
mi-perfil.html

Y se elimino las funciones repetidas: obtenerIniciales para cambiarlas por pipes.
*/

@Pipe({ name: 'iniciales', standalone: true })

// Implementación de la interfaz PipeTransform para definir la lógica de transformación de las iniciales del usuario
export class InicialesPipe implements PipeTransform {
  transform(usuario: any): string {
    if (!usuario) return '';    // Si el usuario es nulo o indefinido, se retorna una cadena vacía
    const n = usuario?.nombre?.[0] ?? '';   // Se obtiene la primera letra del nombre del usuario, si existe, de lo contrario se asigna una cadena vacía
    const a = usuario?.apellido?.[0] ?? ''; // Se obtiene la primera letra del apellido del usuario, si existe, de lo contrario se asigna una cadena vacía
    return (n + a).toUpperCase();   // Se concatenan las iniciales y se convierten a mayúsculas antes de retornarlas
  }
}