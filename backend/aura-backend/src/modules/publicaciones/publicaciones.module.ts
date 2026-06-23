import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicacionesService } from './publicaciones.service';
import { PublicacionesController } from './publicaciones.controller';
import { Publicacion, PublicacionSchema } from './schema/publicacion.schema';
import { StorageModule } from '../../common/storage/storage.module';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema }
    ]),
    StorageModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'secreto',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [PublicacionesController],
  providers: [PublicacionesService],
})
export class PublicacionesModule {}