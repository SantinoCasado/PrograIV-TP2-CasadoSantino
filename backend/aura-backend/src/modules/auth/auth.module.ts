import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { StorageModule } from '../../common/storage/storage.module';

@Module({
  imports: [UsuariosModule, StorageModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
