// File: backend-spa/src/whatsapp/whatsapp.controller.ts
import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, UseInterceptors, UploadedFile, InternalServerErrorException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { WhatsappService } from './whatsapp.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service'; // <-- Importa CloudinaryService de nuevo
import { Gender } from '../client/enums/gender.enum';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Roles } from '../auth/decorators/roles.decorator'; // <-- Importa el decorador
import { UserRole } from '../user/entities/user.entity'; // <-- Importa el enum
import { RolesGuard } from '../auth/guards/roles.guard'; // <-- Importa el guardia

class SendCustomMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  ageMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  ageMax?: number;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
}

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly cloudinaryService: CloudinaryService, // <-- Inyecta CloudinaryService de nuevo
  ) {}

  @Post('send-custom-message')
  @Roles(UserRole.ADMIN) // <-- Usa el decorador
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.OK)
  async sendCustomMessage(
    @Body() sendCustomMessageDto: SendCustomMessageDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imageUrl: string | undefined = undefined;

    // Si se sube un archivo, lo enviamos a Cloudinary para obtener la URL
    if (file) {
      try {
        const result = await this.cloudinaryService.uploadFile(file);
        imageUrl = result.secure_url;
      } catch (error) {
        throw new InternalServerErrorException('Error al subir la imagen a Cloudinary.');
      }
    }

    const { message, ...filters } = sendCustomMessageDto;
    
    // Pasa la URL de la imagen (si existe) al servicio
    const result = await this.whatsappService.sendCustomMessageToFilteredClients(message, filters, imageUrl);
    
    return {
      message: 'Proceso de envío de mensajes iniciado.',
      sent: result.sentCount,
      failed: result.failedCount,
    };
  }
}
