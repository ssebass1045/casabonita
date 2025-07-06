// File: backend-spa/src/employee-availability/employee-availability.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEmployeeAvailabilityDto } from './dto/create-employee-availability.dto';
import { UpdateEmployeeAvailabilityDto } from './dto/update-employee-availability.dto';
import { EmployeeAvailability } from './entities/employee-availability.entity';
import { EmployeeService } from '../employee/employee.service';
import { DayOfWeek } from './enums/day-of-week.enum'; // <-- ¡Añade esta línea!

@Injectable()
export class EmployeeAvailabilityService {
  constructor(
    @InjectRepository(EmployeeAvailability)
    private employeeAvailabilityRepository: Repository<EmployeeAvailability>,
    private employeeService: EmployeeService,
  ) {}

  private async checkEmployeeExists(employeeId: number) {
    await this.employeeService.findOne(employeeId);
  }

  async create(createEmployeeAvailabilityDto: CreateEmployeeAvailabilityDto): Promise<EmployeeAvailability> {
    await this.checkEmployeeExists(createEmployeeAvailabilityDto.employeeId);

    if (createEmployeeAvailabilityDto.startTime >= createEmployeeAvailabilityDto.endTime) {
      throw new BadRequestException('La hora de inicio debe ser anterior a la hora de fin.');
    }

    const newAvailability = this.employeeAvailabilityRepository.create(createEmployeeAvailabilityDto);
    return this.employeeAvailabilityRepository.save(newAvailability);
  }

  async findAll(): Promise<EmployeeAvailability[]> {
    return this.employeeAvailabilityRepository.find();
  }

  async findOne(id: number): Promise<EmployeeAvailability> {
    const availability = await this.employeeAvailabilityRepository.findOne({ where: { id } });
    if (!availability) {
      throw new NotFoundException(`Disponibilidad con ID ${id} no encontrada`);
    }
    return availability;
  }

  async update(id: number, updateEmployeeAvailabilityDto: UpdateEmployeeAvailabilityDto): Promise<EmployeeAvailability> {
    if (updateEmployeeAvailabilityDto.employeeId) {
      await this.checkEmployeeExists(updateEmployeeAvailabilityDto.employeeId);
    }

    if (updateEmployeeAvailabilityDto.startTime && updateEmployeeAvailabilityDto.endTime) {
        if (updateEmployeeAvailabilityDto.startTime >= updateEmployeeAvailabilityDto.endTime) {
            throw new BadRequestException('La hora de inicio debe ser anterior a la hora de fin.');
        }
    }

    const availability = await this.employeeAvailabilityRepository.preload({
      id: id,
      ...updateEmployeeAvailabilityDto,
    });
    if (!availability) {
      throw new NotFoundException(`Disponibilidad con ID ${id} no encontrada para actualizar`);
    }
    return this.employeeAvailabilityRepository.save(availability);
  }

  async remove(id: number): Promise<void> {
    const result = await this.employeeAvailabilityRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Disponibilidad con ID ${id} no encontrada para eliminar`);
    }
  }

  // Método para obtener disponibilidad por empleado y día (útil para el frontend)
  async findByEmployeeAndDay(employeeId: number, dayOfWeek: DayOfWeek): Promise<EmployeeAvailability[]> {
    return this.employeeAvailabilityRepository.find({
      where: { employeeId, dayOfWeek },
      order: { startTime: 'ASC' },
    });
  }
}
