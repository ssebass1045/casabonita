// File: backend-spa/src/cloudinary/cloudinary.provider.ts
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary'; // Importa la v2 del SDK

// Define un token de inyección único para el proveedor
export const CLOUDINARY = 'Cloudinary';

export const CloudinaryProvider: Provider = {
  provide: CLOUDINARY, // Usa el token definido
  useFactory: (configService: ConfigService) => {
    return cloudinary.config({
      cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  },
  inject: [ConfigService], // Inyecta ConfigService para leer .env
};
