// File: backend-spa/src/appointment/dto/get-appointments.dto.ts
import { IsOptional, IsInt, Min, Max, IsEnum, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { AppointmentStatus } from '../enums/appointment-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

// Define las columnas por las que se puede ordenar
export enum AppointmentSortBy {
  ID = 'id',
  START_TIME = 'startTime',
  CLIENT_NAME = 'client.name', // Para ordenar por nombre de cliente relacionado
  EMPLOYEE_NAME = 'employee.name', // Para ordenar por nombre de empleado relacionado
  STATUS = 'status',
  PRICE = 'price',
}

// Define la dirección de ordenación
export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetAppointmentsDto {
  // --- Paginación ---
  @IsOptional()
  @Type(() => Number) // Transforma el string a number
  @IsInt()
  @Min(1)
  page?: number = 1; // Página actual, por defecto 1

  @IsOptional()
  @Type(() => Number) // Transforma el string a number
  @IsInt()
  @Min(1)
  @Max(100) // Límite máximo de elementos por página
  limit?: number = 10; // Elementos por página, por defecto 10

  // --- Filtrado ---
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  clientId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  employeeId?: number;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string; // Formato ISO (YYYY-MM-DD)

  @IsOptional()
  @IsDateString()
  endDate?: string; // Formato ISO (YYYY-MM-DD)

  @IsOptional()
  @IsString()
  search?: string; // Búsqueda por nombre de cliente, empleado, servicio o notas

  // --- Ordenación ---
  @IsOptional()
  @IsEnum(AppointmentSortBy)
  sortBy?: AppointmentSortBy = AppointmentSortBy.START_TIME; // Columna por defecto para ordenar

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC; // Dirección por defecto para ordenar
}
