import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario } from './schema/usuario.schema';
import * as bcrypt from 'bcrypt';
import { StorageService } from '../../common/storage/storage.service';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>, // Inyección del modelo de usuario
    private readonly storageService: StorageService,  // Inyección del servicio de almacenamiento para subir imágenes
  ) {}

  // GET /usuarios — listado completo sin contraseñas
  async listar() {
    return this.usuarioModel.find().select('-contraseña').lean();
  }

  // POST /usuarios — alta de nuevo usuario por admin
  async crear(dto: any, imagen?: Express.Multer.File) {

    // Verificar si ya existe un usuario con el mismo nombre de usuario o correo
    const existe = await this.usuarioModel.findOne({  
      $or: [{ usuario: dto.usuario }, { correo: dto.correo }],
    });
    if (existe) throw new BadRequestException('El usuario o correo ya existe.');

    const hash = await bcrypt.hash(dto.contrasena, 10); // Hash de la contraseña antes de guardarla en la base de datos

    const imagenPerfil = imagen 
    ? await this.storageService.uploadProfileImage(imagen) 
    : undefined;

    // Crear el nuevo usuario con los datos proporcionados y la contraseña hasheada
    const nuevo = new this.usuarioModel({
      nombre: dto.nombre,
      apellido: dto.apellido,
      correo: dto.correo,
      usuario: dto.usuario,
      contraseña: hash,
      fechaNacimiento: dto.fechaNacimiento,
      descripcion: dto.descripcion,
      perfil: dto.perfil ?? 'usuario',
      imagenPerfil,
    });

    await nuevo.save();
    const { contraseña, ...sinPassword } = nuevo.toObject() as any; // Excluir la contraseña del objeto devuelto para no exponerla
    return sinPassword;
  }

  // DELETE /usuarios/:id — baja lógica
  async deshabilitar(id: string) {
    const usuario = await this.usuarioModel.findById(id);
    if (!usuario) throw new NotFoundException('Usuario no encontrado.');
    // Funcion para deshabilitar usuarios viejos que no tienen el campo activa, si el campo activa es true o undefined, lanza un error
    if (usuario.activa === false) throw new BadRequestException('El usuario ya está deshabilitado.');
    if (!usuario.activa) throw new BadRequestException('El usuario ya está deshabilitado.');
    usuario.activa = false;
    
    // Actualizar el usuario en la base de datos y devolver el usuario actualizado sin la contraseña
    return this.usuarioModel.findByIdAndUpdate(
      id,
      { activa: false },
      { new: true, select: '-contraseña' }
    );
  }

  // POST /usuarios/:id/habilitar — alta lógica
  async habilitar(id: string) {
    const usuario = await this.usuarioModel.findById(id); // Buscar el usuario por su ID en la base de datos
    if (!usuario) throw new NotFoundException('Usuario no encontrado.');

    // Funcio para habilitar usuarios viejos que no tienen el campo activa, si el campo activa es true o undefined, lanza un error
    if (usuario.activa === true || usuario.activa === undefined) {
      throw new BadRequestException('El usuario ya está habilitado.');
    } 
    if (usuario.activa) throw new BadRequestException('El usuario ya está habilitado.');
    usuario.activa = true;  // Habilitar el usuario

    // Actualizar el usuario en la base de datos y devolver el usuario actualizado sin la contraseña
    return this.usuarioModel.findByIdAndUpdate(
      id,
      { activa: true },
      { new: true, select: '-contraseña' }
    );
  }
}