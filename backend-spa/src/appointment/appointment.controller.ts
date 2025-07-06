// File: backend-spa/src/appointment/appointment.controller.ts
import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,
  ParseIntPipe, ValidationPipe
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  // --- Rutas Protegidas ---

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body(ValidationPipe) createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentService.create(createAppointmentDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentService.update(id, updateAppointmentDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentService.remove(id);
  }

  // --- Rutas Públicas (o al menos accesibles sin JWT para lectura si se desea) ---
  // Por ahora, las haremos públicas para que puedan ser listadas en el frontend sin login si es necesario.
  // Si solo el admin debe ver la lista, añade @UseGuards(AuthGuard('jwt')) aquí también.

  //@UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.appointmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentService.findOne(id);
  }
}
