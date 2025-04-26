
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { Treatment } from './entities/treatment.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class TreatmentService {
  constructor(
    @InjectRepository(Treatment) // Inyecta el repositorio de Treatment
    private treatmentRepository: Repository<Treatment>,
    private cloudinaryService: CloudinaryService,
  ) {}

  // Crear un nuevo tratamiento
  async create(
    createTreatmentDto: CreateTreatmentDto,
    file?: Express.Multer.File // Acepta un archivo opcional
  ): Promise<Treatment> {

  let imageUrl: string | undefined = undefined;
  if (file) {
    try {
      const result = await this.cloudinaryService.uploadFile(file);
      imageUrl = result.secure_url; // Obtiene la URL segura
    } catch (error) {
      // Maneja el error de subida (ej. log, lanzar excepción específica)
      console.error('Error uploading to Cloudinary:', error);
      // Podrías lanzar una excepción aquí si la subida es obligatoria
    }
  }

  const newTreatment = this.treatmentRepository.create({
      ...createTreatmentDto,
      imageUrl: imageUrl ?? createTreatmentDto.imageUrl, // Usa la URL subida o la del DTO si existe
  });
  return this.treatmentRepository.save(newTreatment);
}

  // Obtener todos los tratamientos
  async findAll(): Promise<Treatment[]> {
    return this.treatmentRepository.find();
  }

  // Obtener un tratamiento por ID
  async findOne(id: number): Promise<Treatment> {
    const treatment = await this.treatmentRepository.findOne({ where: { id } });
    if (!treatment) {
      throw new NotFoundException(`Tratamiento con ID ${id} no encontrado`);
    }
    return treatment;
  }

  // Actualizar un tratamiento por ID
  async update(
    id: number,
    updateTreatmentDto: UpdateTreatmentDto,
    file?: Express.Multer.File // Acepta un archivo opcional
  ): Promise<Treatment> {

  const treatment = await this.treatmentRepository.preload({ id });
  if (!treatment) {
    throw new NotFoundException(`Tratamiento con ID ${id} no encontrado para actualizar`);
  }

  let imageUrl: string | undefined = treatment.imageUrl; // Mantiene la URL existente por defecto
  if (file) {
     // Opcional: Eliminar imagen antigua de Cloudinary antes de subir la nueva
     // if (treatment.imageUrl) {
     //   const publicId = ... // Extraer public_id de treatment.imageUrl
     //   await this.cloudinaryService.deleteFile(publicId);
     // }
    try {
      const result = await this.cloudinaryService.uploadFile(file);
      imageUrl = result.secure_url; // Obtiene la nueva URL segura
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      // Manejar error
    }
  } else if (updateTreatmentDto.imageUrl !== undefined) {
      // Permite actualizar/eliminar la URL manualmente si no se sube archivo
      imageUrl = updateTreatmentDto.imageUrl;
  }


  // Actualiza la entidad con datos del DTO y la nueva URL
  const updatedTreatment = this.treatmentRepository.merge(treatment, {
      ...updateTreatmentDto,
      imageUrl: imageUrl,
  });

  return this.treatmentRepository.save(updatedTreatment);
  }

  // Eliminar un tratamiento por ID
  async remove(id: number): Promise<void> {
    const result = await this.treatmentRepository.delete(id);
    if (result.affected === 0) {
      // Si affected es 0, significa que no se encontró ninguna fila con ese ID
      throw new NotFoundException(`Tratamiento con ID ${id} no encontrado para eliminar`);
    }
    // No se devuelve nada en una eliminación exitosa (o puedes devolver un mensaje)
  }
}
