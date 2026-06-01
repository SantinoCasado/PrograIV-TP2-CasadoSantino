import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { PublicacionesModule } from './modules/publicaciones/publicaciones.module';
import { AuthModule } from './modules/auth/auth.module';
import * as dotenv from 'dotenv';


dotenv.config();  // Carga las variables de entorno desde el archivo .env

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGODB_URI), UsuariosModule, PublicacionesModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
