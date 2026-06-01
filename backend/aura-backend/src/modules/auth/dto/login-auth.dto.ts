import { BaseAuthDto } from './base-auth.dto';

// Solo necesita usuario y contraseña para el login, hereda las validaciones de BaseAuthDto
export class LoginAuthDto extends BaseAuthDto {}  