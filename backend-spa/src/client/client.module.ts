// File: backend-spa/src/client/client.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Importa TypeOrmModule
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { Client } from './entities/client.entity';
import { Appointment } from '../appointment/entities/appointment.entity'; // <-- ¡Importa la entidad Appointment!

@Module({
  imports: [
    TypeOrmModule.forFeature([Client, Appointment]), // <-- ¡Añade Appointment aquí!
  ],
  controllers: [ClientController],
  providers: [ClientService],
  exports: [ClientService], // Asegúrate de que ClientService esté exportado
})
export class ClientModule {}
