import { Controller, Get, Post, Delete, Param, Query, Body, UploadedFile, UseInterceptors, Req, HttpCode } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PublicacionesService } from './publicaciones.service';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { QueryPublicacionDto } from './dto/query-publicacion.dto';
import { Request } from 'express';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  // --------------------- CREAR PUBLICACIÓN ---------------------
  // POST /publicaciones
  @Post()
  @UseInterceptors(FileInterceptor('imagen', { storage: memoryStorage() })) // Usamos memoryStorage para procesar la imagen en memoria y luego subirla a Supabase desde el servicio
  async crear(
    @Body() dto: CreatePublicacionDto,
    @UploadedFile() imagen: Express.Multer.File,
    @Body('usuarioId') usuarioId: string, // sacamos el usuarioId directo del body
  ) {
    return this.publicacionesService.crear(dto, usuarioId, imagen);
  }

  // --------------------- LISTAR PUBLICACIONES ---------------------
  // GET /publicaciones?offset=0&limit=10&orden=fecha&usuarioId=xxx
  @Get()
  async listar(@Query() query: QueryPublicacionDto) {
    return this.publicacionesService.listar(query);
  }

  // --------------------- ELIMINAR PUBLICACIÓN ---------------------
  // DELETE /publicaciones/:id
  @Delete(':id')
  @HttpCode(200)
  async eliminar(
    @Param('id') id: string,
    @Body('usuarioId') usuarioId: string, // directo del body
    @Body('perfil') perfil: string = 'usuario',
  ) {
    return this.publicacionesService.eliminar(id, usuarioId, perfil);
  }

  // --------------------- DAR LIKE ---------------------
  // POST /publicaciones/:id/like
  @Post(':id/like')
  @HttpCode(200)
  async darLike(
    @Param('id') id: string,
    @Body('usuarioId') usuarioId: string,
  ) {
    return this.publicacionesService.darLike(id, usuarioId);
  }

  // --------------------- QUITAR LIKE ---------------------
  // DELETE /publicaciones/:id/like
  @Delete(':id/like')
  @HttpCode(200)
  async quitarLike(
    @Param('id') id: string,
    @Body('usuarioId') usuarioId: string,
  ) {
    return this.publicacionesService.quitarLike(id, usuarioId);
  }
}