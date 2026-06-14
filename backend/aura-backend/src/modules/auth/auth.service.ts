import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario } from '../usuarios/schema/usuario.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { StorageService } from '../../common/storage/storage.service';

// Libreria utilizada para el hasheo de contraseñas es bcrypt: genera hashes seguros de contrasenas. npm install bcrypt @types/bcrypt
@Injectable()
export class AuthService {
  constructor(
    // Inyectamos el modelo de Usuario para poder interactuar con la base de datos
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
    private readonly storageService: StorageService,
    private readonly jwtService: JwtService,  // Inyectamos el servicio de JWT para generar tokens de autenticación
  ) {}

  // --------------------- TOKENS Y VALIDACIONES ----------------------
  // Genera el payload y firma el token
  private generarToken(usuario: any): string {
    const payload = {
      sub: usuario._id,
      usuario: usuario.usuario,
      correo: usuario.correo,
      perfil: usuario.perfil,
    };
    return this.jwtService.sign(payload);
  }

  // Valida el token JWT y devuelve el usuario asociado si el token es válido
  async validarToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const usuario = await this.usuarioModel
      .findById(payload.sub)  // Busca el usuario por su ID (sub es el campo que contiene el ID del usuario en el payload)
      .select('-contraseña') // Excluye la contraseña del usuario para mayor seguridad
      .lean();              // Convierte el documento de Mongoose a un objeto JavaScript simple
      if (!usuario) {
        throw new UnauthorizedException('Usuario no encontrado.');
      }
      return usuario; // Devuelve el usuario encontrado si el token es válido
    } catch (error) {
      throw new UnauthorizedException('Token no válido o expirado.');
    }
  }

  // Función para refrescar el token JWT, genera un nuevo token con la misma información del usuario
  async refrescarToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const { sub, usuario, correo, perfil } = payload;
      const nuevoToken = this.jwtService.sign({ sub, usuario, correo, perfil });
      return { token: nuevoToken };
    } catch (error) {
      throw new UnauthorizedException('Token no válido o expirado.');
    }
  } 

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
    const token = this.generarToken(usuarioSinPassword);  // Genera un token JWT para el nuevo usuario registrado

    // Devuelve el usuario sin la contraseña y el token de autenticación
    return { usuario: usuarioSinPassword, token };
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
    const token = this.generarToken(usuarioSinPassword);  // Genera un token JWT para el usuario que ha iniciado sesión

    return { mensaje: 'Login exitoso', usuario: usuarioSinPassword, token };
  }

  // --------------------- FUNCIONES AUXILIARES ----------------------
  findAll() {
    return this.usuarioModel.find().select('-contraseña'); // Devuelve todos los usuarios sin la contraseña
  }
}
