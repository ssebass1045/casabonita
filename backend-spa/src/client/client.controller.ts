// File: backend-spa/src/client/client.controller.ts
import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,
  ParseIntPipe, ValidationPipe
} from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  // --- Rutas Protegidas ---

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body(ValidationPipe) createClientDto: CreateClientDto) {
    return this.clientService.create(createClientDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateClientDto: UpdateClientDto,
  ) {
    return this.clientService.update(id, updateClientDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.remove(id);
  }

  // --- Rutas Públicas (o al menos accesibles sin JWT para lectura si se desea) ---
  // Por ahora, las haremos públicas para que puedan ser listadas en el frontend sin login si es necesario.
  // Si solo el admin debe ver la lista, añade @UseGuards(AuthGuard('jwt')) aquí también.

  @Get()
  findAll() {
    return this.clientService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.findOne(id);
  }
}
