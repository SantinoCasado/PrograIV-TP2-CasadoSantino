import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { StorageModule } from '../../common/storage/storage.module';

@Module({
  imports: [
    UsuariosModule,
    StorageModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'miclavesupersecreta',  // Clave secreta para firmar los tokens JWT, se recomienda usar una variable de entorno
      signOptions: { expiresIn: '1m' },  // El token expirará en 1 minuto
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule], // Exportacion del JwtModule para que pueda ser utilizado en otros módulos que importen AuthModule
})
export class AuthModule {}
