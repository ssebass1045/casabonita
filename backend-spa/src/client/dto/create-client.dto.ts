// File: backend-spa/src/client/dto/create-client.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, IsEmail, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { Gender } from '../enums/gender.enum';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'email must be a valid email address' })
  email?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string' && value.trim() !== '') {
      const num = parseInt(value, 10);
      return isNaN(num) ? value : num;
    }
    return value;
  })
  @IsInt({ message: 'age must be an integer' })
  @Min(0, { message: 'age must not be less than 0' })
  @Max(120, { message: 'age must not be greater than 120' })
  age?: number;

  @IsOptional()
  @IsEnum(Gender, { message: 'gender must be a valid enum value' })
  gender?: Gender;

  @IsString()
  @IsOptional() 
  observations?: string;
}
