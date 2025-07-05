// File: backend-spa/src/client/client.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { Client } from './entities/client.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client]), // <-- Asegúrate de que esta línea exista
  ],
  controllers: [ClientController],
  providers: [ClientService],
})
export class ClientModule {}
