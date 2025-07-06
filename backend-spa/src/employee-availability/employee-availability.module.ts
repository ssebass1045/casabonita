// File: backend-spa/src/employee-availability/employee-availability.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeAvailabilityService } from './employee-availability.service';
import { EmployeeAvailabilityController } from './employee-availability.controller';
import { EmployeeAvailability } from './entities/employee-availability.entity';
import { EmployeeModule } from '../employee/employee.module'; // Importa EmployeeModule

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeeAvailability]),
    EmployeeModule, // Necesario para inyectar EmployeeService
  ],
  controllers: [EmployeeAvailabilityController],
  providers: [EmployeeAvailabilityService],
  exports: [EmployeeAvailabilityService], // Exporta si otros módulos necesitarán inyectar este servicio
})
export class EmployeeAvailabilityModule {}
