import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const options = {
    origin: 'http://localhost:8080',
  };
  app.enableCors(options);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
