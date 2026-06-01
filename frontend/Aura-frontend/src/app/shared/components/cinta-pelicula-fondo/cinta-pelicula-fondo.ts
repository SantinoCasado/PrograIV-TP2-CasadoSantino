import { Component } from '@angular/core';

@Component({
  selector: 'app-cinematic-login-background',
  standalone: true,
  imports: [],
  templateUrl: './cinta-pelicula-fondo.html',
  styleUrl: './cinta-pelicula-fondo.css',
})
export class CinematicLoginBackground {
  readonly images = [
    '/assets/images/amigos1.avif',
    '/assets/images/amigos2.jpg',
    '/assets/images/familia1.jpg',
    '/assets/images/familia2.webp',
    '/assets/images/mascotas1.jpeg',
    '/assets/images/mascotas2.jpg',
    '/assets/images/paisaje1.avif',
    '/assets/images/paisaje2.jpg',
    '/assets/images/paisaje3.jpg',
  ];

  private shuffle(values: string[]): string[] {
    const output = [...values];

    for (let index = output.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [output[index], output[randomIndex]] = [output[randomIndex], output[index]];
    }

    return output;
  }

  private createStrip(): string[] {
    const shuffledImages = this.shuffle(this.images);
    return [...shuffledImages, ...shuffledImages, ...shuffledImages];
  }

  readonly rows = Array.from({ length: 9 }, (_, index) => ({
    direction: index % 2 === 0 ? 'right' : 'left',
    tint: ['tint-1', 'tint-2', 'tint-3'][index % 3],
    images: this.createStrip(),
  }));
}
