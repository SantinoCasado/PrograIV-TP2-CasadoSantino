import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion } from '../publicaciones/schema/publicacion.schema';
import { Comentario } from '../comentarios/schema/comentarios.schema';

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
    @InjectModel(Comentario.name) private readonly comentarioModel: Model<Comentario>,
  ) {}

  // Publicaciones por usuario en un lapso de tiempo
  async publicacionesPorUsuario(desde: string, hasta: string) {
    return this.publicacionModel.aggregate([
      {
        $match: {   // Filtrar publicaciones activas dentro del rango de fechas
          activa: true,
          createdAt: {
            $gte: new Date(desde),
            $lte: new Date(hasta),
          },
        },
      },
      {
        $group: {   // Agrupar por usuario y contar la cantidad de publicaciones
          _id: '$usuario',
          cantidad: { $sum: 1 },
        },
      },
      {
        $lookup: {  // Unir con la colección de usuarios para obtener el nombre de usuario
          from: 'usuarios',
          localField: '_id',
          foreignField: '_id',
          as: 'usuario',
        },
      },
      { $unwind: '$usuario' },  // Desenrollar el array de usuario para acceder a sus campos
      {
        $project: { // Proyectar los campos que se incluiran en el resultado final
          _id: 0,
          usuario: '$usuario.usuario',
          cantidad: 1,
        },
      },
      { $sort: { cantidad: -1 } },  // Ordenar por cantidad de publicaciones de mayor a menor
    ]);
  }

  // Comentarios en un lapso de tiempo
  async comentariosPorLapso(desde: string, hasta: string) {
    return this.comentarioModel.aggregate([
      {
        $match: {   // Filtrar comentarios activos dentro del rango de fechas
          activa: true,
          createdAt: {
            $gte: new Date(desde),
            $lte: new Date(hasta),
          },
        },
      },
      {
        $group: {   // Agrupar por fecha y contar la cantidad de comentarios
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          cantidad: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },    // Ordenar por fecha de menor a mayor
      {
        $project: { // Proyectar los campos que se incluiran en el resultado final
          _id: 0,
          fecha: '$_id',
          cantidad: 1,
        },
      },
    ]);
  }

  // Comentarios por publicación en un lapso de tiempo
  async comentariosPorPublicacion(desde: string, hasta: string) {
    return this.comentarioModel.aggregate([
      {
        $match: {   // Filtrar comentarios activos dentro del rango de fechas
          activa: true,
          createdAt: {
            $gte: new Date(desde),
            $lte: new Date(hasta),
          },
        },
      },
      {
        $group: {   // Agrupar por publicación y contar la cantidad de comentarios
          _id: '$publicacion',
          cantidad: { $sum: 1 },
        },
      },
      {
        $lookup: {  // Unir con la colección de publicaciones para obtener el título de la publicación
          from: 'publicacions',
          localField: '_id',
          foreignField: '_id',
          as: 'publicacion',
        },
      },
      { $unwind: '$publicacion' },  // Desenrollar el array de publicación para acceder a sus campos
      {
        $project: {
          _id: 0,
          titulo: {
            $cond: {
              if: { $gt: [{ $strLenCP: '$publicacion.titulo' }, 20] },
              then: {
                $concat: [
                  { $substrCP: ['$publicacion.titulo', 0, 20] },
                  '...'
                ]
              },
              else: '$publicacion.titulo'
            }
          },
          cantidad: 1,
        },
      },
      { $sort: { cantidad: -1 } },  // Ordenar por cantidad de comentarios de mayor a menor
    ]);
  }
}