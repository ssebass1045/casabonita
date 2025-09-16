import { IsNumber, IsOptional, IsDateString, IsBoolean, IsString, IsEnum } from 'class-validator';
import { PaymentMethod } from '../../appointment/enums/payment-method.enum'; // <-- Nueva importación

export class CreateClientServicesPackDto {
  @IsNumber()
  clientId: number;

  @IsNumber()
  servicesPackId: number;

  @IsNumber()
  totalPrice: number;

  @IsOptional()
  @IsNumber()
  amountPaid?: number;

  @IsOptional()
  @IsNumber()
  sessionsRemaining?: number;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod; // <-- Cambiar a enum
}