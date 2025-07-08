// File: backend-spa/src/invoice/invoice.module.ts
import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { AppointmentModule } from '../appointment/appointment.module'; // <-- Importa AppointmentModule

@Module({
  imports: [
    AppointmentModule, // Necesario para inyectar AppointmentService
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class InvoiceModule {}
