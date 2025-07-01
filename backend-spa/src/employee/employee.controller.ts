// File: backend-spa/src/employee/employee.controller.ts
import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,
  ParseIntPipe, ValidationPipe, UseInterceptors, UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // Importa FileInterceptor
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AuthGuard } from '@nestjs/passport';
import { Express } from 'express'; // Necesario para el tipo Express.Multer.File

@Controller('employees') // Define el prefijo de ruta para este controlador (/employees)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  // --- Rutas Protegidas (requieren autenticación JWT) ---

  @UseGuards(AuthGuard('jwt')) // Protege esta ruta con el guardia JWT
  @Post() // Maneja peticiones POST a /employees
  @UseInterceptors(FileInterceptor('image')) // Intercepta un archivo del campo 'image'
  create(
    @Body(ValidationPipe) createEmployeeDto: CreateEmployeeDto, // Valida el cuerpo de la petición con el DTO
    @UploadedFile() file?: Express.Multer.File // Inyecta el archivo subido (opcional)
  ) {
    // Llama al servicio para crear el empleado, pasando el DTO y el archivo
    return this.employeeService.create(createEmployeeDto, file);
  }

  @UseGuards(AuthGuard('jwt')) // Protege esta ruta con el guardia JWT
  @Patch(':id') // Maneja peticiones PATCH a /employees/:id
  @UseInterceptors(FileInterceptor('image')) // Intercepta un archivo del campo 'image'
  update(
    @Param('id', ParseIntPipe) id: number, // Extrae y parsea el ID de los parámetros de la ruta
    @Body(ValidationPipe) updateEmployeeDto: UpdateEmployeeDto, // Valida el cuerpo de la petición con el DTO
    @UploadedFile() file?: Express.Multer.File // Inyecta el archivo subido (opcional)
  ) {
    // Llama al servicio para actualizar el empleado, pasando el ID, DTO y archivo
    return this.employeeService.update(id, updateEmployeeDto, file);
  }

  @UseGuards(AuthGuard('jwt')) // Protege esta ruta con el guardia JWT
  @Delete(':id') // Maneja peticiones DELETE a /employees/:id
  remove(@Param('id', ParseIntPipe) id: number) { // Extrae y parsea el ID
    // Llama al servicio para eliminar el empleado
    return this.employeeService.remove(id);
  }

  // --- Rutas Públicas (no requieren autenticación) ---

  @Get() // Maneja peticiones GET a /employees
  findAll() {
    // Llama al servicio para obtener todos los empleados
    return this.employeeService.findAll();
  }

  @Get(':id') // Maneja peticiones GET a /employees/:id
  findOne(@Param('id', ParseIntPipe) id: number) { // Extrae y parsea el ID
    // Llama al servicio para obtener un empleado por ID
    return this.employeeService.findOne(id);
  }
}
