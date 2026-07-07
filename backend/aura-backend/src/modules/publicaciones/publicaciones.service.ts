import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion } from './schema/publicacion.schema';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { QueryPublicacionDto } from './dto/query-publicacion.dto';
import { StorageService } from '../../common/storage/storage.service';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
    private readonly storageService: StorageService,
  ) {}

  // --------------------- CREAR PUBLICACIÓN ---------------------
  async crear(dto: CreatePublicacionDto, usuarioId: string, imagen?: Express.Multer.File) {
    let imagenUrl: string | null = null;

    // Solo se sube imagen si el usuario mandó una
    if (imagen) {
      imagenUrl = await this.storageService.uploadPostImage(imagen);
    }

    const nueva = new this.publicacionModel({
      titulo: dto.titulo,
      mensaje: dto.mensaje,
      imagenUrl,
      usuario: new Types.ObjectId(usuarioId),
    });

    return nueva.save();
  }

  // --------------------- LISTAR PUBLICACIONES ---------------------
  async listar(query: QueryPublicacionDto) {
    const limit = parseInt(query.limit ?? '10');
    const offset = parseInt(query.offset ?? '0');

    // Filtracion siempre por activa: true (baja lógica)
    const filtro: any = { activa: true };

    // Si viene usuarioId filtro por autor
    if (query.usuarioId) {
      filtro.usuario = new Types.ObjectId(query.usuarioId);
    }

    // Ordenamiento: por fecha (default) o por cantidad de likes
    // Para likes uso aggregate, para fecha uso find normal
    if (query.orden === 'likes') {
      return this.publicacionModel.aggregate([
        { $match: filtro },
        { $addFields: { cantidadLikes: { $size: '$likes' } } },
        { $sort: { cantidadLikes: -1 } },
        { $skip: offset },
        { $limit: limit },
        {
          $lookup: {
            from: 'usuarios',
            localField: 'usuario',
            foreignField: '_id',
            as: 'usuario'
          }
        },
        { $unwind: '$usuario' },
        {
          $lookup: {
            from: 'comentarios',
            let: { pubId: '$_id' },
            pipeline: [
              { $match: { $expr: { $and: [
                { $eq: ['$publicacion', '$$pubId'] },
                { $eq: ['$activa', true] }
              ]}}},
              { $count: 'total' }
            ],
            as: 'comentariosInfo'
          }
        },
        {
          $addFields: {
            totalComentarios: {
              $ifNull: [{ $arrayElemAt: ['$comentariosInfo.total', 0] }, 0]
            }
          }
        },
        {
          $project: {
            'usuario.contraseña': 0,
            'usuario.fechaNacimiento': 0,
            'usuario.descripcion': 0,
            comentariosInfo: 0,
          }
        }
      ]);
    }

    // Orden por fecha descendente (mas recientes primero)
    return this.publicacionModel.aggregate([
      { $match: filtro }, // Filtrar por activa: true y por usuarioId si viene
      { $sort: { createdAt: -1 } }, // Mas recientes primero
      { $skip: offset },  // Saltar registros
      { $limit: limit },  // Limitar cantidad de registros
      {
        $lookup: {        // Populate manual de usuario
          from: 'usuarios',
          localField: 'usuario',
          foreignField: '_id',
          as: 'usuario'
        }
      },
      { $unwind: '$usuario' },  // Desenrollar el array de usuario para acceder a sus campos
      {
        $lookup: {  // Unir con la colección de comentarios para contar la cantidad de comentarios por publicación
          from: 'comentarios',
          let: { pubId: '$_id' },
          pipeline: [
            { $match: { $expr: { $and: [
              { $eq: ['$publicacion', '$$pubId'] },
              { $eq: ['$activa', true] }
            ]}}},
            { $count: 'total' }
          ],
          as: 'comentariosInfo'
        }
      },
      {
        $addFields: { // Agregar un campo totalComentarios con la cantidad de comentarios (0 si no hay)
          totalComentarios: {
            $ifNull: [{ $arrayElemAt: ['$comentariosInfo.total', 0] }, 0]
          }
        }
      },
      {
        $project: { // Proyectar los campos que se incluiran en el resultado final
          'usuario.contraseña': 0,
          'usuario.fechaNacimiento': 0,
          'usuario.descripcion': 0,
          comentariosInfo: 0,
        }
      }
    ]);
  }

  // --------------------- BAJA LÓGICA ---------------------
  async eliminar(publicacionId: string, usuarioId: string, perfil: string) {
    const publicacion = await this.publicacionModel.findById(publicacionId);

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada.');
    }

    if (!publicacion.activa) {
      throw new BadRequestException('La publicación ya fue eliminada.');
    }

    // Solo el autor o un administrador pueden eliminar
    const esAutor = publicacion.usuario.toString() === usuarioId;
    const esAdmin = perfil === 'administrador';

    if (!esAutor && !esAdmin) {
      throw new ForbiddenException('No tenés permiso para eliminar esta publicación.');
    }

    publicacion.activa = false;
    return publicacion.save();
  }

  // --------------------- DAR LIKE ---------------------
  async darLike(publicacionId: string, usuarioId: string) {
    const publicacion = await this.publicacionModel.findById(publicacionId);

    if (!publicacion || !publicacion.activa) {
      throw new NotFoundException('Publicación no encontrada.');
    }

    const yaLikeo = publicacion.likes.some(id => id.toString() === usuarioId);

    if (yaLikeo) {
      throw new BadRequestException('Ya le diste me gusta a esta publicación.');
    }

    publicacion.likes.push(new Types.ObjectId(usuarioId));
    return publicacion.save();
  }

  // --------------------- QUITAR LIKE ---------------------
  async quitarLike(publicacionId: string, usuarioId: string) {
    const publicacion = await this.publicacionModel.findById(publicacionId);

    if (!publicacion || !publicacion.activa) {
      throw new NotFoundException('Publicación no encontrada.');
    }

    const index = publicacion.likes.findIndex(id => id.toString() === usuarioId);

    if (index === -1) {
      throw new BadRequestException('No le habías dado me gusta a esta publicación.');
    }

    publicacion.likes.splice(index, 1);
    return publicacion.save();
  }

  // --------------------- OBTENER PUBLICACIÓN POR ID ---------------------
  async obtenerPorId(id: string) {
    const publicacion = await this.publicacionModel
      .findOne({ _id: id, activa: true })
      .populate('usuario', 'nombre apellido imagenPerfil usuario activa')
      .lean() as any;

    if (!publicacion) throw new NotFoundException('Publicación no encontrada.');

    const usuario = publicacion.usuario as any;
    if (usuario?.activa === false) {
      throw new NotFoundException('Esta publicación ya no está disponible. Consultá con un administrador.');
    }

    return publicacion;
  }
}