// Dto que maneja los parámetros de la ruta GET (paginación y ordenamiento)
import { IsOptional, IsIn, IsNumberString, IsString } from 'class-validator';

export class QueryPublicacionDto {
  @IsOptional()
  @IsNumberString()
  offset?: string; // desde qué publicación empezar (paginación)

  @IsOptional()
  @IsNumberString()
  limit?: string; // cuántas traer por página

  @IsOptional()
  @IsIn(['fecha', 'likes'], { message: 'El orden debe ser "fecha" o "likes".' })
  orden?: 'fecha' | 'likes'; // Por fecha o por cantidad de likes

  @IsOptional()
  @IsString()
  usuarioId?: string; // para filtrar publicaciones de un usuario particular 
}