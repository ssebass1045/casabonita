// File: backend-spa/src/whatsapp/whatsapp.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { ClientModule } from '../client/client.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module'; // <-- Importa CloudinaryModule

@Module({
  imports: [ConfigModule, ClientModule, CloudinaryModule], // <-- Añade CloudinaryModule
  controllers: [WhatsappController],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
