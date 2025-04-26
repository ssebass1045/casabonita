// File: backend-spa/src/cloudinary/cloudinary.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service'; // Importa el servicio

@Module({
  imports: [ConfigModule],
  providers: [CloudinaryProvider, CloudinaryService], // Añade el servicio
  exports: [CloudinaryProvider, CloudinaryService], // Exporta ambos
})
export class CloudinaryModule {}
