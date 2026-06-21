import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateComentarioDto {
  @IsString()
  @IsNotEmpty({ message: 'El comentario no puede estar vacío.' })
  @MaxLength(200, { message: 'El comentario no puede tener más de 200 caracteres.' })
  mensaje: string;
}