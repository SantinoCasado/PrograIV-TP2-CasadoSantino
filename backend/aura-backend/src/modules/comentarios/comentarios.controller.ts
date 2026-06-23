import { Controller, Get, Post, Put, Param, Body, Query, HttpCode } from '@nestjs/common';
import { ComentariosService } from './comentarios.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('publicaciones/:publicacionId/comentarios')
@UseGuards(JwtAuthGuard)
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  // GET /publicaciones/:publicacionId/comentarios?offset=0&limit=5
  @Get()
  async listar(
    @Param('publicacionId') publicacionId: string,
    @Query('offset') offset: string,
    @Query('limit') limit: string,
  ) {
    return this.comentariosService.listar(
      publicacionId,
      parseInt(offset ?? '0'),
      parseInt(limit ?? '5'),
    );
  }

  // POST /publicaciones/:publicacionId/comentarios
  @Post()
  @HttpCode(201)
  async crear(
    @Param('publicacionId') publicacionId: string,
    @Body() dto: CreateComentarioDto,
    @Body('usuarioId') usuarioId: string,
  ) {
    return this.comentariosService.crear(publicacionId, usuarioId, dto);
  }

  // PUT /publicaciones/:publicacionId/comentarios/:comentarioId
  @Put(':comentarioId')
  async actualizar(
    @Param('comentarioId') comentarioId: string,
    @Body() dto: UpdateComentarioDto,
    @Body('usuarioId') usuarioId: string,
  ) {
    return this.comentariosService.actualizar(comentarioId, usuarioId, dto);
  }
}