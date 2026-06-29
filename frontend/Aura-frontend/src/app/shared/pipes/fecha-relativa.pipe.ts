import { Pipe, PipeTransform } from '@angular/core';

/*  Donde fue utilizado el pipe:
publicaciones.html
publicacion.html
mi-perfil.html

Y se elimino las funciones repetidas: ObtenerFechaRelativa para cambiarlas por pipes.
*/

@Pipe({ name: 'fechaRelativa', standalone: true })  // Pipe para mostrar la fecha en formato relativo (hace X minutos, hace X horas, hace X días)
export class FechaRelativaPipe implements PipeTransform {   // Implementación de la interfaz PipeTransform para definir la lógica de transformación de la fecha
  transform(fecha: string): string {
    if (!fecha) return '';  // Si la fecha es nula o indefinida, se retorna una cadena vacía
    const diff = Date.now() - new Date(fecha).getTime();    // Se calcula la diferencia en milisegundos entre la fecha actual y la fecha proporcionada
    const minutos = Math.floor(diff / 60000);   // Se convierte la diferencia de milisegundos a minutos
    if (minutos < 1) return 'ahora';    // Si la diferencia es menor a un minuto, se retorna 'ahora'
    if (minutos < 60) return `hace ${minutos} min`; // Si la diferencia es menor a una hora, se retorna 'hace X minutos'
    const horas = Math.floor(minutos / 60); // Se convierte la diferencia de minutos a horas
    if (horas < 24) return `hace ${horas} h`;   // Si la diferencia es menor a un día, se retorna 'hace X horas'
    const dias = Math.floor(horas / 24);    // Se convierte la diferencia de horas a días
    return `hace ${dias} d`;    // Si la diferencia es mayor o igual a un día, se retorna 'hace X días'
  }
}