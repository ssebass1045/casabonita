import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeAvailabilityDto } from './create-employee-availability.dto';

export class UpdateEmployeeAvailabilityDto extends PartialType(CreateEmployeeAvailabilityDto) {}
