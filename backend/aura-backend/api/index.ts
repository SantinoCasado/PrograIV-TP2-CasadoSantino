import { NestFactory } from '@nestjs/core'; // Importa el módulo principal de la aplicación
import { ExpressAdapter } from '@nestjs/platform-express';  // Importa el adaptador para Express, que permite usar NestJS con Express
import { ValidationPipe } from '@nestjs/common';    // Importa el pipe de validación, que se utiliza para validar las solicitudes entrantes
import express from 'express';      // Importa Express, que es el framework de servidor web utilizado para manejar las solicitudes HTTP
import serverless from 'serverless-http';   // Importa el módulo serverless-http, que permite ejecutar la aplicación NestJS en un entorno sin servidor (serverless)
import { AppModule } from '../src/app.module';  // Importa el módulo principal de la aplicación, que contiene la configuración y los controladores

let cachedHandler: any; // Variable para almacenar el handler de la aplicación, lo que permite reutilizarlo en llamadas posteriores y mejorar el rendimiento en entornos serverless

async function bootstrap() {
    const expressApp = express(); // Crea una instancia de Express

    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));    // Crea una aplicación NestJS utilizando el módulo principal y el adaptador de Express
    app.useGlobalPipes(new ValidationPipe());   // Configura el pipe de validación global para validar todas las solicitudes entrantes

    app.enableCors({
        origin: [
            'http://localhost:4200',
            'https://progra-iv-tp-2-casado-santino.vercel.app',
        ],
        credentials: true,
    }); // Habilita CORS para permitir solicitudes desde diferentes orígenes

    await app.init(); // Inicializa la aplicación NestJS

    return serverless(expressApp); // Devuelve el handler de la aplicación Express envuelta en serverless, lo que permite ejecutarla en un entorno sin servidor
}

// El handler se exporta como la función predeterminada, lo que permite que sea invocado por el entorno serverless cada vez que se recibe una solicitud HTTP. Si el handler ya está almacenado en caché, se reutiliza para mejorar el rendimiento.
export default async function handler(req: any, res: any) {
    if (!cachedHandler) {   // Si el handler no está almacenado en caché, se llama a la función bootstrap para crear la aplicación y almacenar el handler en caché
        cachedHandler = await bootstrap();
    }
    return cachedHandler(req, res); // Se invoca el handler con la solicitud y la respuesta, lo que permite que la aplicación NestJS maneje la solicitud HTTP entrante
}