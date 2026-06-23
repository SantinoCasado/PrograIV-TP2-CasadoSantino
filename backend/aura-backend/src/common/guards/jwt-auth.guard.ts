import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean { // Se ejecuta para determinar si la solicitud puede continuar
    const request = context.switchToHttp().getRequest();    // Obtiene la solicitud HTTP del contexto
    const authHeader = request.headers['authorization'];    // Obtiene el encabezado de autorización de la solicitud

    if (!authHeader || !authHeader.startsWith('Bearer ')) { // Verifica si el encabezado de autorización está presente y tiene el formato correcto
      throw new UnauthorizedException('Token no proporcionado.');   // Lanza una excepción si no se proporciona un token
    }

    const token = authHeader.split(' ')[1]; // Extrae el token del encabezado de autorización (después de "Bearer ")

    try {
      const payload = this.jwtService.verify(token);    // Verifica el token usando el servicio JWT y obtiene la carga útil (payload) del token
      request.usuario = payload; // lo adjunta al request para usarlo en los controllers
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado.');
    }
  }
}