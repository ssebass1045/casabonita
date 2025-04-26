// File: backend-spa/src/cloudinary/cloudinary.service.ts
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'; // Importa UploadApiResponse
import { CloudinaryResponse } from './cloudinary-response';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {

  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    // Nota: El tipo de retorno de la promesa es CloudinaryResponse,
    // pero el resultado real de Cloudinary es UploadApiResponse.
    // Asegúrate de que tu interfaz CloudinaryResponse sea compatible.
    return new Promise<UploadApiResponse>((resolve, reject) => { // Cambiado a UploadApiResponse temporalmente para claridad
      const uploadStream = cloudinary.uploader.upload_stream(
        (error, result) => {
          if (error) {
            return reject(error); // Rechaza la promesa si hay error
          }
          // Añade esta comprobación: si no hay error, result debería estar definido.
          if (!result) {
             return reject(new Error('Cloudinary upload failed without error or result.'));
          }
          // Si no hay error y result está definido, resuelve la promesa
          resolve(result);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
    // Si quieres mantener CloudinaryResponse como tipo de retorno, puedes castear:
    // return new Promise<CloudinaryResponse>((resolve, reject) => { ... resolve(result as CloudinaryResponse); });
    // O asegurarte de que CloudinaryResponse y UploadApiResponse sean compatibles.
  }

  // ... (posible método deleteFile)
}

