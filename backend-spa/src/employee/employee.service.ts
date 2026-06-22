// File: backend-spa/src/employee/employee.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service'; // Importa CloudinaryService

export interface EmployeeRemovalResult {
  action: 'deleted' | 'deactivated';
  message: string;
  employeeId: number;
}

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee) // Inyecta el repositorio de Employee
    private employeeRepository: Repository<Employee>,
    private cloudinaryService: CloudinaryService, // Inyecta CloudinaryService
  ) {}

  // Crear un nuevo empleado
  async create(
    createEmployeeDto: CreateEmployeeDto,
    file?: Express.Multer.File, // Acepta un archivo opcional para la imagen
  ): Promise<Employee> {
    let imageUrl: string | undefined = undefined;
    if (file) {
      try {
        const result = await this.cloudinaryService.uploadFile(file);
        imageUrl = result.secure_url; // Obtiene la URL segura de Cloudinary
      } catch (error) {
        console.error('Error uploading employee image to Cloudinary:', error);
        // Aquí podrías lanzar una excepción específica o manejar el error de otra forma
      }
    }

    const newEmployee = this.employeeRepository.create({
      ...createEmployeeDto,
      imageUrl: imageUrl ?? createEmployeeDto.imageUrl, // Usa la URL subida o la del DTO si existe
    });
    return this.employeeRepository.save(newEmployee);
  }

  // Obtener todos los empleados
  async findAll(includeInactive = false): Promise<Employee[]> {
    return this.employeeRepository.find({
      where: includeInactive ? {} : { isActive: true },
      order: {
        isActive: 'DESC',
        name: 'ASC',
      },
    });
  }

  // Obtener un empleado por ID
  async findOne(id: number, includeInactive = true): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: includeInactive ? { id } : { id, isActive: true },
    });
    if (!employee) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }
    return employee;
  }

  async findActiveOne(id: number): Promise<Employee> {
    return this.findOne(id, false);
  }

  // Actualizar un empleado por ID
  async update(
    id: number,
    updateEmployeeDto: UpdateEmployeeDto,
    file?: Express.Multer.File, // Acepta un archivo opcional para la nueva imagen
  ): Promise<Employee> {
    const employee = await this.employeeRepository.preload({ id });
    if (!employee) {
      throw new NotFoundException(
        `Empleado con ID ${id} no encontrado para actualizar`,
      );
    }

    let imageUrl: string | undefined = employee.imageUrl; // Mantiene la URL existente por defecto
    if (file) {
      // Opcional: Aquí podrías añadir lógica para eliminar la imagen antigua de Cloudinary
      // si el empleado ya tenía una y se sube una nueva.
      try {
        const result = await this.cloudinaryService.uploadFile(file);
        imageUrl = result.secure_url; // Obtiene la nueva URL segura
      } catch (error) {
        console.error(
          'Error uploading new employee image to Cloudinary:',
          error,
        );
        // Manejar error
      }
    } else if (updateEmployeeDto.imageUrl !== undefined) {
      // Permite actualizar/eliminar la URL manualmente si no se sube archivo
      imageUrl = updateEmployeeDto.imageUrl;
    }

    // Actualiza la entidad con datos del DTO y la nueva URL
    const updatedEmployee = this.employeeRepository.merge(employee, {
      ...updateEmployeeDto,
      imageUrl: imageUrl,
    });

    return this.employeeRepository.save(updatedEmployee);
  }

  // Eliminar un empleado por ID
  async setActiveStatus(id: number, isActive: boolean): Promise<Employee> {
    const employee = await this.findOne(id, true);
    employee.isActive = isActive;
    return this.employeeRepository.save(employee);
  }

  // Eliminar un empleado por ID
  async remove(id: number): Promise<EmployeeRemovalResult> {
    await this.findOne(id, true);

    try {
      const result = await this.employeeRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(
          `Empleado con ID ${id} no encontrado para eliminar`,
        );
      }

      return {
        action: 'deleted',
        message: 'Empleado eliminado permanentemente.',
        employeeId: id,
      };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).driverError?.code === '23503'
      ) {
        await this.setActiveStatus(id, false);
        return {
          action: 'deactivated',
          message:
            'El empleado tiene historial asociado. Se ocultó y desactivó en lugar de eliminarse.',
          employeeId: id,
        };
      }

      throw error;
    }
  }
}
