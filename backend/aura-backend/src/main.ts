import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = new Set([
    'http://localhost:4200',
    'https://progra-iv-tp-2-casado-santino-angul.vercel.app',
  ]);
  const frontendPreviewRegex = /^https:\/\/progra-iv-tp-2-casado-santino-angul(?:-[a-z0-9-]+)?\.vercel\.app$/i;

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin) || frontendPreviewRegex.test(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS bloqueado para origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
