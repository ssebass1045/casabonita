// File: backend-spa/src/appointment/appointment.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { Appointment } from './entities/appointment.entity';
import { ClientModule } from '../client/client.module';
import { EmployeeModule } from '../employee/employee.module';
import { TreatmentModule } from '../treatment/treatment.module';
import { EmployeeAvailabilityModule } from '../employee-availability/employee-availability.module'; // <-- ¡Añade esta línea!

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment]),
    ClientModule,
    EmployeeModule,
    TreatmentModule,
    EmployeeAvailabilityModule, // <-- Asegúrate de que esté aquí
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}
