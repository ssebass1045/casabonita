import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log('Iniciando servidor...');
  console.log("-----------------------");
  console.log('Server started on port ' + port);
  console.log('Visit http://localhost:' + port);
  console.log("-----------------------");
  console.log(`conectado a la base de datos "${process.env.DATABASE_NAME}" puerto ${process.env.DATABASE_PORT}`);
  console.log("...")
}
bootstrap();
