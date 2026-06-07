import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreatePublicacionDto {
  @IsString()
  @IsNotEmpty({ message: 'El título no puede estar vacío.' })
  @MaxLength(70, { message: 'El título no puede tener más de 70 caracteres.' })
  titulo: string;

  @IsString()
  @IsNotEmpty({ message: 'El mensaje no puede estar vacío.' })
  @MaxLength(500, { message: 'El mensaje no puede tener más de 500 caracteres.' })
  mensaje: string;

  @IsOptional()
  @IsString()
  imagenUrl?: string; 
}

