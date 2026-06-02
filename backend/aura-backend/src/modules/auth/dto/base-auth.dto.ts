import { IsNotEmpty, MinLength, Matches, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class BaseAuthDto {
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  usuario: string;

  @Transform(({ value, obj }) => value ?? obj?.contrasena)
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9]).*$/, { message: 'La contraseña debe tener al menos una mayúscula y un número.' })
  contraseña: string;
}