import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { PublicacionesModule } from './modules/publicaciones/publicaciones.module';
import { ComentariosModule } from './modules/comentarios/comentarios.module';
import { AuthModule } from './modules/auth/auth.module';
import { StorageModule } from './common/storage/storage.module';
import { EstadisticasModule } from './modules/estadisticas/estadisticas.module';
import * as dotenv from 'dotenv';


dotenv.config();  // Carga las variables de entorno desde el archivo .env

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 20000,
      maxPoolSize: 10,
    }),
    UsuariosModule,
    PublicacionesModule,
    AuthModule,
    StorageModule,
    ComentariosModule,
    EstadisticasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
