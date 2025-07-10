// File: backend-spa/src/cloudinary/cloudinary.service.ts
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary upload failed without error or result.'));
          resolve(result);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  // --- NUEVO MÉTODO: uploadPdfBuffer ---
  uploadPdfBuffer(buffer: Buffer, filename: string): Promise<CloudinaryResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'invoices', // Opcional: guarda los PDFs en una carpeta específica en Cloudinary
          resource_type: 'raw', // Trata el archivo como un archivo genérico, no como una imagen
          public_id: filename.replace('.pdf', ''), // Usa el nombre del archivo como public_id
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary PDF upload failed without error or result.'));
          resolve(result);
        },
      );
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }
}
