// File: backend-spa/src/employee/dto/create-employee.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator'; // <-- Importa IsEnum
import { Transform } from 'class-transformer';
import { EmployeeSpecialty } from '../enums/employee-specialty.enum'; // <-- Importa el enum

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsEnum(EmployeeSpecialty, { message: 'specialty must be a valid enum value' }) // <-- Validación para el enum
  @Transform(({ value }) => { // <-- Añade transformación para manejar string de frontend
    if (typeof value === 'string' && Object.values(EmployeeSpecialty).includes(value as EmployeeSpecialty)) {
      return value;
    }
    return undefined; // Si no es un valor válido del enum, lo dejamos como undefined para que IsEnum lo capture
  })
  specialty?: EmployeeSpecialty; // <-- Usa el tipo EmployeeSpecialty del enum

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
