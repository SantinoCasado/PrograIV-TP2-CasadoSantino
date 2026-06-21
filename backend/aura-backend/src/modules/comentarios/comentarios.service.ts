import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comentario } from '../comentarios/schema/comentarios.schema';
import { Publicacion } from '../publicaciones/schema/publicacion.schema';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name) private readonly comentarioModel: Model<Comentario>,
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
  ) {}

  // --------------------- AGREGAR COMENTARIO ---------------------
  async crear(publicacionId: string, usuarioId: string, dto: CreateComentarioDto) {
    const publicacion = await this.publicacionModel.findById(publicacionId);    // Verificamos que la publicación exista y esté activa

    if (!publicacion || !publicacion.activa) {
      throw new NotFoundException('Publicación no encontrada.');
    }

    const nuevo = new this.comentarioModel({
      publicacion: new Types.ObjectId(publicacionId),
      usuario: new Types.ObjectId(usuarioId),
      mensaje: dto.mensaje,
    });

    await nuevo.save();

    // Devuelve el comentario con el usuario populado
    return this.comentarioModel
      .findById(nuevo._id)
      .populate('usuario', 'nombre apellido imagenPerfil usuario')
      .lean();
  }

  // --------------------- LISTAR COMENTARIOS ---------------------
  async listar(publicacionId: string, offset = 0, limit = 5) {
    const publicacion = await this.publicacionModel.findById(publicacionId);

    if (!publicacion || !publicacion.activa) {
      throw new NotFoundException('Publicación no encontrada.');
    }

    return this.comentarioModel
      .find({ publicacion: new Types.ObjectId(publicacionId), activa: true })
      .sort({ createdAt: -1 }) // más recientes primero
      .skip(offset)
      .limit(limit)
      .populate('usuario', 'nombre apellido imagenPerfil usuario')
      .lean();
  }

  // --------------------- MODIFICAR COMENTARIO ---------------------
  async actualizar(comentarioId: string, usuarioId: string, dto: UpdateComentarioDto) {
    const comentario = await this.comentarioModel.findById(comentarioId);

    if (!comentario || !comentario.activa) {
      throw new NotFoundException('Comentario no encontrado.');
    }

    // Solo el autor puede editar su comentario
    if (comentario.usuario.toString() !== usuarioId) {
      throw new ForbiddenException('No tenés permiso para editar este comentario.');
    }

    comentario.mensaje = dto.mensaje;
    comentario.modificado = true;

    await comentario.save();

    return this.comentarioModel
      .findById(comentarioId)
      .populate('usuario', 'nombre apellido imagenPerfil usuario')
      .lean();
  }
}