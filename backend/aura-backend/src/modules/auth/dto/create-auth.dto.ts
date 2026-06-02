import { IsNotEmpty, IsEmail, MinLength, MaxLength, Matches, IsOptional, IsIn, IsDateString } from 'class-validator';
import { BaseAuthDto } from './base-auth.dto';
import { Transform } from 'class-transformer';

export class CreateAuthDto extends BaseAuthDto {
  @IsNotEmpty()
  @MaxLength(15)
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/, { message: 'El nombre solo puede contener letras y espacios.' })
  nombre: string;

  @IsNotEmpty()
  @MaxLength(15)
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/, { message: 'El apellido solo puede contener letras y espacios.' })
  apellido: string;

  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @Transform(({ value, obj }) => value ?? obj?.repetirContrasena)
  @IsNotEmpty()
  repetirContraseña: string;

  @IsDateString()
  @IsNotEmpty()
  fechaNacimiento: Date;

  @IsNotEmpty()
  @MaxLength(200)
  descripcion: string;

  @IsOptional()
  @IsIn(['usuario', 'administrador'])
  perfil?: string; // 'usuario' o 'administrador', por defecto 'usuario'
}