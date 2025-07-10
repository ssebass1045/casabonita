// File: backend-spa/src/appointment/appointment.controller.ts
import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,
  ParseIntPipe, ValidationPipe, Query // <-- Importa Query
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { GetAppointmentsDto } from './dto/get-appointments.dto'; // <-- Importa el nuevo DTO
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

  // --- RUTA findAll MODIFICADA ---
  @Get()
  findAll(@Query(ValidationPipe) query: GetAppointmentsDto) { // <-- Acepta el DTO de consulta
    return this.appointmentService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('client/:clientId')
  findByClientId(@Param('clientId', ParseIntPipe) clientId: number) {
    return this.appointmentService.findByClientId(clientId);
  }
}
