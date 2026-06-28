import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { AdminGuard } from '../../common/guards/admin.guard';

@Controller('estadisticas')
@UseGuards(AdminGuard)
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  // GET /estadisticas/publicaciones-por-usuario?desde=2026-01-01&hasta=2026-12-31
  @Get('publicaciones-por-usuario') // Endpoint para obtener la cantidad de publicaciones por usuario en un lapso de tiempo
  async publicacionesPorUsuario(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    return this.estadisticasService.publicacionesPorUsuario(desde, hasta);
  }

  // GET /estadisticas/comentarios-por-lapso?desde=2026-01-01&hasta=2026-12-31
  @Get('comentarios-por-lapso') // Endpoint para obtener la cantidad de comentarios por día en un lapso de tiempo
  async comentariosPorLapso(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    return this.estadisticasService.comentariosPorLapso(desde, hasta);
  }

  // GET /estadisticas/comentarios-por-publicacion?desde=2026-01-01&hasta=2026-12-31
  @Get('comentarios-por-publicacion') // Endpoint para obtener la cantidad de comentarios por publicación en un lapso de tiempo
  async comentariosPorPublicacion(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    return this.estadisticasService.comentariosPorPublicacion(desde, hasta);
  }
}