// File: backend-spa/src/appointment/dto/update-appointment.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateAppointmentDto } from './create-appointment.dto';
import { IsEnum, ValidateIf, IsNotEmpty } from 'class-validator'; // <-- Asegúrate de que IsNotEmpty esté aquí
import { AppointmentStatus } from '../enums/appointment-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  // Sobrescribimos la validación para el caso de actualización
  @IsEnum(PaymentStatus)
  @IsNotEmpty() // <-- Este es el decorador que causaba el error
  @ValidateIf(o => o.status === AppointmentStatus.REALIZADA)
  @IsEnum(PaymentStatus, { message: 'paymentStatus must be "Pagado" if appointment status is "Realizada"' })
  paymentStatus?: PaymentStatus; // Hacemos opcional para PartialType
}
