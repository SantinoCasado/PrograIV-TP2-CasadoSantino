import { NestFactory } from '@nestjs/core'; // Importa NestFactory para crear la aplicación NestJS
import { ExpressAdapter } from '@nestjs/platform-express'; // Importa ExpressAdapter para adaptar la aplicación NestJS a Express
import { ValidationPipe } from '@nestjs/common'; // Importa ValidationPipe para validar las solicitudes entrantes
import express, { Express } from 'express'; // Importa Express para crear una aplicación Express y definir su tipo
import { AppModule } from '../src/app.module'; // Importa el módulo principal de la aplicación NestJS

let cachedApp: Express | null = null;   // Variable para almacenar la instancia de la aplicación Express y evitar reinicializaciones innecesarias

async function createApp(): Promise<Express> {
  if (cachedApp) return cachedApp;  // Si la aplicación ya ha sido creada, devuelve la instancia almacenada en caché

  const expressApp = express(); // Crea una nueva instancia de la aplicación Express
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));  // Crea la aplicación NestJS utilizando el módulo principal y adaptándola a Express

  app.useGlobalPipes(new ValidationPipe({ transform: true })); // Habilita transform para aplicar @Transform de los DTOs (aliases ASCII/sin ñ)

  app.enableCors({  // Configura CORS para permitir solicitudes desde el frontend, especificando los orígenes permitidos y habilitando el envío de credenciales (cookies, headers de autenticación, etc.)
    origin: [
      'http://localhost:4200',
      'https://progra-iv-tp-2-casado-santino.vercel.app',
    ],
    credentials: true,
  });

  await app.init(); // Inicializa la aplicación NestJS, lo que prepara los controladores, servicios y otros componentes para manejar las solicitudes entrantes
  cachedApp = expressApp;   // Almacena la instancia de la aplicación Express en caché para futuras solicitudes, evitando la necesidad de reinicializar toda la aplicación NestJS en cada solicitud
  return cachedApp; // Devuelve la instancia de la aplicación Express adaptada con NestJS, lista para manejar las solicitudes entrantes
}

// Exporta una función de manejo de solicitudes que se ejecutará cada vez que se reciba una solicitud HTTP. Esta función crea o reutiliza la aplicación Express adaptada con NestJS y la utiliza para manejar la solicitud entrante y enviar la respuesta correspondiente.
export default async function handler(req: any, res: any) { 
  const app = await createApp();
  return app(req, res);
}