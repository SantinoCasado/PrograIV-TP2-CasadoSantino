import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario } from '../usuarios/schema/usuario.schema';
import * as bcrypt from 'bcrypt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { StorageService } from '../../common/storage/storage/storage.service';

// Libreria utilizada para el hasheo de contraseñas es bcrypt: genera hashes seguros de contrasenas. npm install bcrypt @types/bcrypt
@Injectable()
export class AuthService {
  constructor(
    // Inyectamos el modelo de Usuario para poder interactuar con la base de datos
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
    private readonly storageService: StorageService,
  ) {}

  // --------------------- REGISTRO DE USUARIOS ----------------------
  async registro(createAuthDto: CreateAuthDto, imagen: Express.Multer.File) {
    // --------- Validacion de la contraseña ----------
      // Si las contraseñas no coinciden, lanza una excepción
    if (createAuthDto.contrasena !== createAuthDto.repetirContrasena) {
      throw new BadRequestException('Las contraseñas no coinciden.');
    }

    // --------- Validacion de unicidad del usuario o correo ----------
    const usuarioExistente = await this.usuarioModel.findOne({
      $or: [
        { usuario: createAuthDto.usuario },
        { correo: createAuthDto.correo },
      ],
    });
    if (usuarioExistente) {
      throw new BadRequestException('El usuario o correo ya existe.');
    }

    // --------- Encriptar la contraseña antes de guardarla ----------
      // Encripta la contraseña usando bcrypt con un salt de 10 rondas (salts = encriptación adicional para hacer el hash más seguro)
    const hash = await bcrypt.hash(createAuthDto.contrasena, 10);

    // --------- Guardar imagen ----------
    const imagenPerfil = await this.storageService.uploadProfileImage(imagen);

    // --------- Crear el nuevo usuario en la base de datos ----------
    const nuevoUsuario = new this.usuarioModel({
      nombre: createAuthDto.nombre,
      apellido: createAuthDto.apellido,
      correo: createAuthDto.correo,
      usuario: createAuthDto.usuario,
      contraseña: hash,
      fechaNacimiento: createAuthDto.fechaNacimiento,
      descripcion: createAuthDto.descripcion,
      perfil: createAuthDto.perfil || 'usuario',
      imagenPerfil,
    });

    await nuevoUsuario.save();
    const { contraseña, ...usuarioSinPassword } = nuevoUsuario.toObject() as any;

    // Devuelve el usuario sin la contraseña ni el repetirContraseña para guardar la seguridad de los datos sensibles
    return usuarioSinPassword;
  }

  // --------------------- LOGIN DE USUARIOS ----------------------
  async login(loginAuthDto: LoginAuthDto) {
    // Busca el usuario por su nombre de usuario o correo electrónico
    const usuario = await this.usuarioModel.findOne({
      $or: [
        { usuario: loginAuthDto.usuario },
        { correo: loginAuthDto.usuario },
      ],
    });

    // Si no se encuentra el usuario, lanza una excepción
    if (!usuario) {
      throw new BadRequestException('Usuario o correo no encontrado.');
    }

    // Valida la contraseña comparando el hash almacenado con la contraseña proporcionada
    const usuarioObj = usuario.toObject() as any; // Convierte el documento de Mongoose a un objeto JavaScript para acceder a sus propiedades
    const passwordValida = await bcrypt.compare(loginAuthDto.contrasena, usuarioObj.contraseña);
    if (!passwordValida) {
      throw new BadRequestException('Contraseña incorrecta.');
    }

    // Si el login es exitoso, devuelve un mensaje de éxito (en un caso real, aquí se generaría un token JWT o similar)
    const { contraseña,  ...usuarioSinPassword } = usuario.toObject() as any;
    return { mensaje: 'Login exitoso', usuario: usuarioSinPassword };
  }

  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  async findAll() {
    // Listado basico de usuarios para pruebas, sin exponer contraseñas.
    return this.usuarioModel.find().select('-contraseña').lean();
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
