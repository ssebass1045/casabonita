// File: backend-spa/src/client/client.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { Client } from './entities/client.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client]),
  ],
  controllers: [ClientController],
  providers: [ClientService],
  exports: [ClientService], // <-- ¡Añade esta línea!
})
export class ClientModule {}
