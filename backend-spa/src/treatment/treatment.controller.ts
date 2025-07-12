
import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,
  ParseIntPipe, ValidationPipe, UseInterceptors, UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // Importa FileInterceptor
import { TreatmentService } from './treatment.service';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { AuthGuard } from '@nestjs/passport';
import { Express } from 'express'; // Necesario para el tipo Express.Multer.File
// Multer no se usa directamente aquí, pero su tipo sí a través de Express
// import { Multer } from 'multer';
import { Roles } from '../auth/decorators/roles.decorator'; // <-- Importa el decorador
import { UserRole } from '../user/entities/user.entity'; // <-- Importa el enum
import { RolesGuard } from '../auth/guards/roles.guard'; // <-- Importa el guardia

//@UseGuards(AuthGuard('jwt'), RolesGuard) // Protege todas las rutas de este controlador
@Controller('treatments')
export class TreatmentController {
  constructor(private readonly treatmentService: TreatmentService) {}

  // --- Rutas Protegidas ---

  @UseGuards(AuthGuard('jwt'), RolesGuard) // Protegido
  @Post()
  @Roles(UserRole.ADMIN) // Solo ADMIN puede crear tratamientos
  @UseInterceptors(FileInterceptor('image')) // Intercepta archivo del campo 'image'
  create(
    @Body(ValidationPipe) createTreatmentDto: CreateTreatmentDto,
    @UploadedFile() file?: Express.Multer.File // Inyecta el archivo (opcional)
  ) {
    // Pasa el DTO y el archivo (si existe) al servicio
    return this.treatmentService.create(createTreatmentDto, file);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard) // Protegido
  @Patch(':id')
  @Roles(UserRole.ADMIN) // Solo ADMIN puede actualizar tratamientos
  @UseInterceptors(FileInterceptor('image')) // Intercepta archivo del campo 'image'
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateTreatmentDto: UpdateTreatmentDto,
    @UploadedFile() file?: Express.Multer.File // Inyecta el archivo (opcional)
  ) {
    // Pasa el ID, el DTO y el archivo (si existe) al servicio
    return this.treatmentService.update(id, updateTreatmentDto, file);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard) // Protegido
  @Delete(':id')
  @Roles(UserRole.ADMIN) // Solo ADMIN puede eliminar tratamientos
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.treatmentService.remove(id);
  }

  // --- Rutas Públicas ---

  @Get() // Público
  findAll() {
    return this.treatmentService.findAll();
  }

  @Get(':id') // Público
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.treatmentService.findOne(id);
  }
}
