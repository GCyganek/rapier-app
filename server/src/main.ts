import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const options = {
    origin: [
      'http://localhost:8080',
      'https://62a5bcee8ab5b100099707af--sweet-kitsune-4698d9.netlify.app/',
    ],
    allowedHeaders:
      'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe',
    methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
    credentials: true,
  };
  app.enableCors(options);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
