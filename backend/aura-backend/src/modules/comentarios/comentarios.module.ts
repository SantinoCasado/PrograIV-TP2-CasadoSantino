import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ComentariosService } from './comentarios.service';
import { ComentariosController } from './comentarios.controller';
import { Comentario, ComentarioSchema } from './schema/comentarios.schema';
import { Publicacion, PublicacionSchema } from '../publicaciones/schema/publicacion.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comentario.name, schema: ComentarioSchema },
      { name: Publicacion.name, schema: PublicacionSchema },
    ]),
  ],
  controllers: [ComentariosController],
  providers: [ComentariosService],
})
export class ComentariosModule {}