// File: backend-spa/src/employee/dto/create-employee.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  specialty?: string;

  @IsString()
  @IsOptional() 
  description?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string; // Esto se usará si no se sube un archivo directamente
}
