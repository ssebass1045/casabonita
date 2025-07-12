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
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';

//@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  // --- Rutas Protegidas ---

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  create(@Body(ValidationPipe) createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentService.create(createAppointmentDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentService.update(id, updateAppointmentDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentService.remove(id);
  }

  // --- RUTA findAll MODIFICADA ---
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  findAll(@Query(ValidationPipe) query: GetAppointmentsDto) { // <-- Acepta el DTO de consulta
    return this.appointmentService.findAll(query);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentService.findOne(id);
  }

  
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('client/:clientId')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  findByClientId(@Param('clientId', ParseIntPipe) clientId: number) {
    return this.appointmentService.findByClientId(clientId);
  }
}
