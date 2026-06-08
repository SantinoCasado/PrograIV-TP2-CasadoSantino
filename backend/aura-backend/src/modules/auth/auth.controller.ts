import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { LoginAuthDto } from './dto/login-auth.dto';
import type { Express } from 'express';
/*
Dependencias necesarias para el módulo de autenticación:
npm install bcrypt @types/bcrypt multer @types/multer

bcrypt: para encriptar las contraseñas de los usuarios antes de almacenarlas en la base de datos, lo que mejora la seguridad.
@types/bcrypt: proporciona definiciones de tipos para bcrypt, lo que facilita su uso en un proyecto TypeScript.

multer: para manejar la carga de archivos, como imágenes de perfil, en las solicitudes HTTP.
@types/multer: proporciona definiciones de tipos para multer, lo que facilita su uso en un proyecto TypeScript.
*/

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  @UseInterceptors(FileInterceptor('imagen'))
  async registro(@Body() dto: CreateAuthDto, @UploadedFile() imagen: Express.Multer.File) {
    return this.authService.registro(dto, imagen);
  }

  @Post('login')
  async login(@Body() dto: LoginAuthDto) {
    return this.authService.login(dto);
  }
}
