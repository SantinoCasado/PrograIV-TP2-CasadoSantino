import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Usuario, UsuarioSchema } from './schema/usuario.schema';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { StorageModule } from '../../common/storage/storage.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
    JwtModule.register({  //  Configuración del módulo JWT para la autenticación
      secret: process.env.JWT_SECRET ?? 'secreto',
      signOptions: { expiresIn: '15m' },
    }),
    StorageModule,
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [MongooseModule],
})
export class UsuariosModule {}