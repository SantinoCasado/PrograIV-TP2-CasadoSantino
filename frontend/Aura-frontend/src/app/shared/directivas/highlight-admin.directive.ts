import { Directive, ElementRef, Input, OnInit } from '@angular/core';

/* 
Donde se utilizo la directiva HighlightAdminDirective:

En el archivo dashboard-usuarios.html, en la sección de usuarios, se aplicó la directiva a los elementos <article> 
que representan a cada usuario. Esto asegura que si el perfil del usuario es "administrador", se resalten visualmente
*/

@Directive({
  selector: '[appHighlightAdmin]',
  standalone: true,
})

// Directiva que resalta elementos HTML si el perfil del usuario es "administrador"
export class HighlightAdminDirective implements OnInit {
  @Input() appHighlightAdmin = ''; // recibe el perfil del usuario

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    if (this.appHighlightAdmin === 'administrador') {
      this.el.nativeElement.style.borderColor = '#7fd9ff';
      this.el.nativeElement.style.boxShadow = '5px 5px 0 #04203b, 0 0 12px rgba(127, 217, 255, 0.2)';
    }
  }
}