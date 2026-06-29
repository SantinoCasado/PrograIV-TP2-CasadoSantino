import { Directive, Input, HostListener, ElementRef } from '@angular/core';

/*
Donde se utilizo la directiva ImgFallbackDirective:

En el archivo publicaciones.html, en la sección de publicaciones, se aplicó la directiva a las etiquetas <img> 
que muestran los avatares de los usuarios. Esto asegura que si la imagen del avatar no se carga correctamente, 
se ocultará la imagen rota y se mostrará un texto alternativo.

  */

@Directive({
  selector: 'img[appImgFallback]',
  standalone: true,
})

// Directiva que se aplica a elementos <img> y proporciona una funcionalidad de fallback en caso de error al cargar la imagen
export class ImgFallbackDirective {
  @Input() appImgFallback = ''; // texto alternativo si la imagen falla

  constructor(private el: ElementRef<HTMLImageElement>) {}

  @HostListener('error')
  onError(): void {
    // Ocultamos la imagen rota
    this.el.nativeElement.style.display = 'none';
  }
}