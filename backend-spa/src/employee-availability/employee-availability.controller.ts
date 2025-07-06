// File: backend-spa/src/employee-availability/employee-availability.controller.ts
import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,
  ParseIntPipe, ValidationPipe, Query // Importa Query para parámetros de consulta
} from '@nestjs/common';
import { EmployeeAvailabilityService } from './employee-availability.service';
import { CreateEmployeeAvailabilityDto } from './dto/create-employee-availability.dto';
import { UpdateEmployeeAvailabilityDto } from './dto/update-employee-availability.dto';
import { AuthGuard } from '@nestjs/passport';
import { DayOfWeek } from './enums/day-of-week.enum'; // Importa el enum

@Controller('employee-availabilities')
export class EmployeeAvailabilityController {
  constructor(private readonly employeeAvailabilityService: EmployeeAvailabilityService) {}

  // --- Rutas Protegidas ---

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body(ValidationPipe) createEmployeeAvailabilityDto: CreateEmployeeAvailabilityDto) {
    return this.employeeAvailabilityService.create(createEmployeeAvailabilityDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateEmployeeAvailabilityDto: UpdateEmployeeAvailabilityDto,
  ) {
    return this.employeeAvailabilityService.update(id, updateEmployeeAvailabilityDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.employeeAvailabilityService.remove(id);
  }

  // --- Rutas Públicas ---

  @Get()
  findAll() {
    return this.employeeAvailabilityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employeeAvailabilityService.findOne(id);
  }

  // Nueva ruta para obtener disponibilidad por empleado y día
  @Get('employee/:employeeId/day/:dayOfWeek')
  findByEmployeeAndDay(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Param('dayOfWeek', new ValidationPipe({ transform: true })) dayOfWeek: DayOfWeek, // Valida el enum
  ) {
    return this.employeeAvailabilityService.findByEmployeeAndDay(employeeId, dayOfWeek);
  }
}
