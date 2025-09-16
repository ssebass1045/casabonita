import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateSessionDto {
  @IsNumber()
  clientServicesPackId: number;

  @IsNumber()
  employeeId: number;

  @IsNumber()
  @Min(0)
  employeePayment: number;

  @IsOptional()
  @IsString()
  notes?: string;
}