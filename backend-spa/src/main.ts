import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express'; // <-- Importa NestExpressApplication
import { join } from 'path'; // <-- Importa join de path

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }));
// --- NUEVA CONFIGURACIÓN PARA ARCHIVOS ESTÁTICOS ---
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // Esto hará que los archivos en la carpeta 'uploads' sean accesibles desde la URL /uploads
  });
  // --- FIN NUEVA CONFIGURACIÓN ---
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  

  console.log('Iniciando servidor...');
  console.log("-----------------------");
  console.log('Server started on port ' + port);
  //console.log('Visit http://localhost:' + port);
  console.log("-----------------------");
  console.log(`conectado a la base de datos "${process.env.DATABASE_NAME}" puerto ${process.env.DATABASE_PORT}`);
  console.log("...")
}
bootstrap();
