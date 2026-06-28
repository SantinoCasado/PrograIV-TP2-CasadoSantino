import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { EstadisticasService } from './estadisticas.service';
import { EstadisticasController } from './estadisticas.controller';
import { Publicacion, PublicacionSchema } from '../publicaciones/schema/publicacion.schema';
import { Comentario, ComentarioSchema } from '../comentarios/schema/comentarios.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Comentario.name, schema: ComentarioSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'secreto',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [EstadisticasController],
  providers: [EstadisticasService],
})
export class EstadisticasModule {}