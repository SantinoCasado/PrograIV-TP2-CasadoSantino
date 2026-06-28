import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    // Verificar si el encabezado de autorización está presente y tiene el formato correcto
    if (!authHeader || !authHeader.startsWith('Bearer ')) { 
      throw new UnauthorizedException('Token no proporcionado.');
    }

    const token = authHeader.split(' ')[1]; // Extraer el token del encabezado de autorización

    try {
      const payload = this.jwtService.verify(token);  // Verificar y decodificar el token JWT

      // Verificar si el perfil del usuario es 'administrador'
      if (payload.perfil !== 'administrador') {
        throw new ForbiddenException('Acceso restringido a administradores.');
      }

      request.usuario = payload;
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new UnauthorizedException('Token inválido o expirado.');
    }
  }
}