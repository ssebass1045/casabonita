// File: backend-spa/src/employee-availability/dto/create-employee-availability.dto.ts
import { IsNotEmpty, IsNumber, IsEnum, IsString, Matches, Min } from 'class-validator';
import { DayOfWeek } from '../enums/day-of-week.enum';

export class CreateEmployeeAvailabilityDto {
  @IsNumber()
  @IsNotEmpty()
  employeeId: number;

  @IsEnum(DayOfWeek)
  @IsNotEmpty()
  dayOfWeek: DayOfWeek;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'startTime must be in HH:MM format' })
  startTime: string; // Formato HH:MM

  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'endTime must be in HH:MM format' })
  endTime: string; // Formato HH:MM

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  maxAppointmentsAtOnce: number;
}
