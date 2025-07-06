// File: backend-spa/src/appointment/dto/create-appointment.dto.ts
import { IsNotEmpty, IsNumber, IsDateString, IsEnum, IsOptional, Min, ValidateIf, IsString } from 'class-validator'; // <-- Asegúrate de que IsString esté aquí
import { Transform } from 'class-transformer';
import { AppointmentStatus } from '../enums/appointment-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

export class CreateAppointmentDto {
  @IsNumber()
  @IsNotEmpty()
  clientId: number;

  @IsNumber()
  @IsNotEmpty()
  employeeId: number;

  @IsNumber()
  @IsNotEmpty()
  treatmentId: number;

  @IsDateString()
  @IsNotEmpty()
  startTime: string; // Se envía como string ISO, se transformará a Date en la entidad

  @IsDateString()
  @IsNotEmpty()
  endTime: string; // Se envía como string ISO, se transformará a Date en la entidad

  @IsEnum(AppointmentStatus)
  @IsNotEmpty()
  status: AppointmentStatus;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string' && value.trim() !== '') {
      const num = parseFloat(value);
      return isNaN(num) ? value : num;
    }
    return value;
  })
  @IsNumber({}, { message: 'price must be a number' })
  @Min(0, { message: 'price must not be less than 0' })
  price?: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  // Regla de negocio: Si el estado de la cita es 'Realizada', el estado de pago debe ser 'Pagado'
  @ValidateIf(o => o.status === AppointmentStatus.REALIZADA)
  @IsEnum(PaymentStatus, { message: 'paymentStatus must be "Pagado" if appointment status is "Realizada"' })
  paymentStatus: PaymentStatus;

  @IsOptional()
  @IsString() // <-- Este es el decorador que causaba el error
  notes?: string;
}
