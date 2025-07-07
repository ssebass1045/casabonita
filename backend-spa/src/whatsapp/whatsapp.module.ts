// File: backend-spa/src/whatsapp/whatsapp.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Importa ConfigModule
import { WhatsappService } from './whatsapp.service';

@Module({
  imports: [ConfigModule], // Necesario para ConfigService
  providers: [WhatsappService],
  exports: [WhatsappService], // <-- ¡Exporta el servicio!
})
export class WhatsappModule {}
