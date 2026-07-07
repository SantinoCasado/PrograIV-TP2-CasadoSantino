import { Component, OnInit, signal, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Navbar } from '../../../layouts/navbar/navbar';
import { EstadisticasService } from '../../../core/services/estadisticas/estadisticas.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-estadisticas',
  standalone: true,
  imports: [CommonModule, Navbar, ReactiveFormsModule],
  templateUrl: './dashboard-estadisticas.html',
  styleUrl: './dashboard-estadisticas.css',
})
export class DashboardEstadisticas implements OnInit {
  //---------- Estados de la escena ----------
  cargando = signal(false);
  mensajeError = signal('');
  form!: FormGroup;

  // Referencias a los canvas de los gráficos
  private chartPubUsuario: Chart | null = null;
  private chartComentariosLapso: Chart | null = null;
  private chartComentariosPub: Chart | null = null;

  constructor(
    private fb: FormBuilder,
    private estadisticasService: EstadisticasService,
  ) {}

  ngOnInit(): void {
    // Rango por defecto: último mes
    const hasta = new Date().toISOString().split('T')[0];
    const desde = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    this.form = this.fb.group({
      desde: [desde, Validators.required],
      hasta: [hasta, Validators.required],
    });

    this.cargarEstadisticas();
  }

  // --------- Funciones de la escena ----------
  cargarEstadisticas(): void {
    if (this.form.invalid) return;

    const { desde, hasta } = this.form.value; // Obtenemos las fechas del formulario
    this.cargando.set(true);
    this.mensajeError.set('');

    // Destruimos gráficos anteriores si existen
    this.chartPubUsuario?.destroy();
    this.chartComentariosLapso?.destroy();
    this.chartComentariosPub?.destroy();

    // Llamamos a los tres endpoints en paralelo
    Promise.all([
      this.estadisticasService.publicacionesPorUsuario(desde, hasta).toPromise(), // Converte el Observable a Promise
      this.estadisticasService.comentariosPorLapso(desde, hasta).toPromise(), // Convierte el Observable a Promise
      this.estadisticasService.comentariosPorPublicacion(desde, hasta).toPromise(), // Convierte el Observable a Promise
    ]).then(([pubUsuario, comentariosLapso, comentariosPub]) => { // Cuando todas las promesas se resuelven
      this.cargando.set(false);
      setTimeout(() => {
        this.renderPubUsuario(pubUsuario ?? []);  // Renderiza el gráfico de publicaciones por usuario
        this.renderComentariosLapso(comentariosLapso ?? []);  // Renderiza el gráfico de comentarios por lapso
        this.renderComentariosPub(comentariosPub ?? []);  // Renderiza el gráfico de comentarios por publicación
      }, 100); // pequeño delay para que los canvas estén en el DOM
    }).catch(() => {
      this.mensajeError.set('No se pudieron cargar las estadísticas.');
      this.cargando.set(false);
    });
  }

  // Gráfico de barras — publicaciones por usuario
  private renderPubUsuario(data: any[]): void {
    const canvas = document.getElementById('chartPubUsuario') as HTMLCanvasElement; // Obtiene el canvas del DOM
    if (!canvas) return;  // Si no existe el canvas, sale de la función

    // Configuración del gráfico de barras
    this.chartPubUsuario = new Chart(canvas, {
      type: 'bar',  // Tipo de gráfico: barras
      data: { // Datos del gráfico
        labels: data.map(d => d.usuario), // Etiquetas del eje X: nombres de usuarios
        datasets: [{  // Conjunto de datos
          label: 'Publicaciones',
          data: data.map(d => d.cantidad),
          backgroundColor: 'rgba(85, 212, 255, 0.5)',
          borderColor: '#55d4ff',
          borderWidth: 2,
        }]
      },
      options: {  // Opciones del gráfico
        responsive: true, // Hace que el gráfico sea responsivo
        maintainAspectRatio: false, // Mantiene la relación de aspecto del gráfico
        plugins: {  // Configuración de plugins
          legend: { labels: { color: '#c8eaf8' } },
        },
        scales: { // Configuración de los ejes
          x: { ticks: { color: '#9dcce6' }, grid: { color: 'rgba(127,217,255,0.1)' } }, // Eje X: color de las etiquetas y del grid
          y: { ticks: { color: '#9dcce6' }, grid: { color: 'rgba(127,217,255,0.1)' } }, // Eje Y: color de las etiquetas y del grid
        }
      }
    });
  }

  // Gráfico de líneas — comentarios por lapso de tiempo
  private renderComentariosLapso(data: any[]): void {
    const canvas = document.getElementById('chartComentariosLapso') as HTMLCanvasElement;
    if (!canvas) return;

    // Configuración del gráfico de líneas
    this.chartComentariosLapso = new Chart(canvas, {
      type: 'line', // Tipo de gráfico: línea
      data: { // Datos del gráfico
        labels: data.map(d => d.fecha),
        datasets: [{
          label: 'Comentarios',
          data: data.map(d => d.cantidad),
          borderColor: '#7fd9ff',
          backgroundColor: 'rgba(127, 217, 255, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4, // Curvatura de la línea
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#c8eaf8' } },
        },
        scales: {
          x: { ticks: { color: '#9dcce6' }, grid: { color: 'rgba(127,217,255,0.1)' } },
          y: { ticks: { color: '#9dcce6' }, grid: { color: 'rgba(127,217,255,0.1)' } },
        }
      }
    });
  }

  // Gráfico de torta — comentarios por publicación
  private renderComentariosPub(data: any[]): void {
    const canvas = document.getElementById('chartComentariosPub') as HTMLCanvasElement;
    if (!canvas) return;

    this.chartComentariosPub = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.titulo),
        datasets: [{
          data: data.map(d => d.cantidad),
          backgroundColor: [
            'rgba(85, 212, 255, 0.7)',
            'rgba(10, 143, 211, 0.7)',
            'rgba(56, 180, 230, 0.7)',
            'rgba(4, 75, 116, 0.7)',
            'rgba(168, 234, 255, 0.7)',
          ],
          borderColor: '#04162e',
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: '#c8eaf8' } },
        }
      }
    });
  }
}