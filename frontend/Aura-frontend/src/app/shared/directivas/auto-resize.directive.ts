import { Directive, HostListener, ElementRef, OnInit } from '@angular/core';

/*
Donde fue implementada esta directiva: 
En el componente de nueva publicación, específicamente en el campo de texto del mensaje. Se utiliza para que 
el área de texto se ajuste automáticamente a la cantidad de contenido que el usuario ingresa, mejorando la 
experiencia de usuario al permitir que el mensaje se vea completo sin necesidad de barras de desplazamiento.
*/

@Directive({
  selector: 'textarea[appAutoResize]',
  standalone: true,
})

// Directiva que ajusta automáticamente la altura de un elemento <textarea> según su contenido
export class AutoResizeDirective implements OnInit {
  constructor(private el: ElementRef<HTMLTextAreaElement>) {}

  ngOnInit(): void {
    this.resize();
  }

  @HostListener('input')    // Escucha el evento de entrada en el <textarea> y llama al método resize para ajustar la altura
  onInput(): void {
    this.resize();
  }

  private resize(): void {  // Método privado que ajusta la altura del <textarea> según su contenido
    const el = this.el.nativeElement;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }
}