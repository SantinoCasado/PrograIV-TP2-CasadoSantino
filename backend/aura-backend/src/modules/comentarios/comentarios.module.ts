import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ComentariosService } from './comentarios.service';
import { ComentariosController } from './comentarios.controller';
import { Comentario, ComentarioSchema } from './schema/comentarios.schema';
import { Publicacion, PublicacionSchema } from '../publicaciones/schema/publicacion.schema';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comentario.name, schema: ComentarioSchema },
      { name: Publicacion.name, schema: PublicacionSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'secreto',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [ComentariosController],
  providers: [ComentariosService],
})
export class ComentariosModule {}