import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateServicesPackDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  totalPrice: number;

  @IsNumber()
  sessionCount: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}