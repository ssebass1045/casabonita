// File: backend-spa/src/invoice/invoice.module.ts
import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { AppointmentModule } from '../appointment/appointment.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module'; // <-- Importa CloudinaryModule

@Module({
  imports: [
    AppointmentModule,
    WhatsappModule,
    CloudinaryModule, // <-- Añade CloudinaryModule aquí
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class InvoiceModule {}
