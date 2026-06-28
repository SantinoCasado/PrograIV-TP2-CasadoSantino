import { Controller, Get, Post, Delete, Param, Body, UploadedFile, UseInterceptors, UseGuards, HttpCode } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UsuariosService } from './usuarios.service';
import { AdminGuard } from '../../common/guards/admin.guard';

@Controller('usuarios')
@UseGuards(AdminGuard) // todas las rutas requieren ser administrador
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // Lista todos los usuarios (GET /usuarios)
  @Get()
  async listar() {
    return this.usuariosService.listar();
  }

  // Crea un nuevo usuario (POST /usuarios)
  @Post()
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('imagen', { storage: memoryStorage() }))
  async crear(@Body() dto: any, @UploadedFile() imagen?: Express.Multer.File) {
    return this.usuariosService.crear(dto, imagen);
  }

  // Baja lógica de un usuario (DELETE /usuarios/:id)
  @Delete(':id')
  @HttpCode(200)
  async deshabilitar(@Param('id') id: string) {
    return this.usuariosService.deshabilitar(id);
  }

  // Alta lógica de un usuario (POST /usuarios/:id/habilitar)
  @Post(':id/habilitar')
  @HttpCode(200)
  async habilitar(@Param('id') id: string) {
    return this.usuariosService.habilitar(id);
  }
}