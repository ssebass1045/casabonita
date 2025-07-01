// File: backend-spa/src/employee/employee.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Importa TypeOrmModule
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { Employee } from './entities/employee.entity'; // Importa la entidad Employee
import { CloudinaryModule } from '../cloudinary/cloudinary.module'; // Importa CloudinaryModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee]), // <-- Asegúrate de que esta línea exista
    CloudinaryModule, // <-- Asegúrate de que CloudinaryModule esté aquí
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  // Si EmployeeService o EmployeeController necesitan ser usados en otros módulos,
  // deberías exportarlos aquí. Por ahora, no es estrictamente necesario si solo se usan internamente.
})
export class EmployeeModule {}
