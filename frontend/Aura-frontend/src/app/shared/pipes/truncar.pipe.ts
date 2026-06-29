import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncar', standalone: true })

//// Implementación de la interfaz PipeTransform para definir la lógica de transformación del texto truncado
export class TruncarPipe implements PipeTransform {
// Método transform que recibe un texto y un límite opcional (por defecto 100) y retorna el texto truncado si excede el límite, agregando '...' al final
  transform(texto: string, limite = 100): string {
    if (!texto) return '';  // Si el texto es nulo o indefinido, se retorna una cadena vacía
    if (texto.length <= limite) return texto;   // Si la longitud del texto es menor o igual al límite, se retorna el texto completo
    return texto.slice(0, limite).trimEnd() + '...';  // Si la longitud del texto excede el límite, se retorna el texto truncado hasta el límite, eliminando espacios al final y agregando '...'
  }
}