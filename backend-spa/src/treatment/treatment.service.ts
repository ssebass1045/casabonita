import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { Treatment, TreatmentCategory } from './entities/treatment.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

export interface TreatmentRemovalResult {
  action: 'deleted' | 'deactivated';
  message: string;
  treatmentId: number;
}

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
    file?: Express.Multer.File, // Acepta un archivo opcional
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
  async findAll(filters?: {
    category?: TreatmentCategory;
    search?: string;
    featured?: boolean;
    includeInactive?: boolean;
  }): Promise<Treatment[]> {
    const qb = this.treatmentRepository.createQueryBuilder('treatment');

    if (!filters?.includeInactive) {
      qb.andWhere('treatment.isActive = true');
    }

    if (filters?.category) {
      qb.andWhere('treatment.category = :category', {
        category: filters.category,
      });
    }

    if (filters?.featured === true) {
      qb.andWhere('treatment.isFeatured = true');
    }

    if (filters?.search?.trim()) {
      const search = `%${filters.search.trim().toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(treatment.name) LIKE :search OR LOWER(treatment.description) LIKE :search)',
        { search },
      );
    }

    qb.orderBy('treatment.name', 'ASC');
    return qb.getMany();
  }

  // Obtener un tratamiento por ID
  async findOne(id: number, includeInactive = true): Promise<Treatment> {
    const treatment = await this.treatmentRepository.findOne({
      where: includeInactive ? { id } : { id, isActive: true },
    });
    if (!treatment) {
      throw new NotFoundException(`Tratamiento con ID ${id} no encontrado`);
    }
    return treatment;
  }

  async findActiveOne(id: number): Promise<Treatment> {
    return this.findOne(id, false);
  }

  // Actualizar un tratamiento por ID
  async update(
    id: number,
    updateTreatmentDto: UpdateTreatmentDto,
    file?: Express.Multer.File, // Acepta un archivo opcional
  ): Promise<Treatment> {
    const treatment = await this.treatmentRepository.preload({ id });
    if (!treatment) {
      throw new NotFoundException(
        `Tratamiento con ID ${id} no encontrado para actualizar`,
      );
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
  async setActiveStatus(id: number, isActive: boolean): Promise<Treatment> {
    const treatment = await this.findOne(id, true);
    treatment.isActive = isActive;
    return this.treatmentRepository.save(treatment);
  }

  async remove(id: number): Promise<TreatmentRemovalResult> {
    await this.findOne(id, true);

    try {
      const result = await this.treatmentRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(
          `Tratamiento con ID ${id} no encontrado para eliminar`,
        );
      }

      return {
        action: 'deleted',
        message: 'Tratamiento eliminado permanentemente.',
        treatmentId: id,
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
            'El tratamiento tiene historial asociado. Se ocultó y desactivó en lugar de eliminarse.',
          treatmentId: id,
        };
      }

      throw error;
    }
  }
}
