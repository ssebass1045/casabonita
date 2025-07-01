// File: backend-spa/src/employee/employee.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service'; // Importa CloudinaryService

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
      file?: Express.Multer.File // Acepta un archivo opcional para la imagen
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
  async findAll(): Promise<Employee[]> {
    return this.employeeRepository.find();
  }

  // Obtener un empleado por ID
  async findOne(id: number): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({ where: { id } });
    if (!employee) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }
    return employee;
  }

  // Actualizar un empleado por ID
  async update(
      id: number,
      updateEmployeeDto: UpdateEmployeeDto,
      file?: Express.Multer.File // Acepta un archivo opcional para la nueva imagen
    ): Promise<Employee> {

    const employee = await this.employeeRepository.preload({ id });
    if (!employee) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado para actualizar`);
    }

    let imageUrl: string | undefined = employee.imageUrl; // Mantiene la URL existente por defecto
    if (file) {
       // Opcional: Aquí podrías añadir lógica para eliminar la imagen antigua de Cloudinary
       // si el empleado ya tenía una y se sube una nueva.
      try {
        const result = await this.cloudinaryService.uploadFile(file);
        imageUrl = result.secure_url; // Obtiene la nueva URL segura
      } catch (error) {
        console.error('Error uploading new employee image to Cloudinary:', error);
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
  async remove(id: number): Promise<void> {
    const result = await this.employeeRepository.delete(id);
    if (result.affected === 0) {
      // Si affected es 0, significa que no se encontró ninguna fila con ese ID
      throw new NotFoundException(`Empleado con ID ${id} no encontrado para eliminar`);
    }
    // No se devuelve nada en una eliminación exitosa (o puedes devolver un mensaje)
  }
}
