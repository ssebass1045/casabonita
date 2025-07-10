// File: backend-spa/src/client/client.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'; // <-- Añade BadRequestException
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';
import { Gender } from './enums/gender.enum';
import { Appointment } from '../appointment/entities/appointment.entity'; // <-- Importa Appointment

// Define una interfaz para los filtros de clientes
interface ClientFilters {
  ageMin?: number;
  ageMax?: number;
  gender?: Gender;
}

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(Appointment) // <-- Inyecta el repositorio de Appointment
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const newClient = this.clientRepository.create(createClientDto);
    return this.clientRepository.save(newClient);
  }

  async findAll(filters?: ClientFilters): Promise<Client[]> {
    const queryBuilder = this.clientRepository.createQueryBuilder('client');

    if (filters?.ageMin !== undefined) {
      queryBuilder.andWhere('client.age >= :ageMin', { ageMin: filters.ageMin });
    }
    if (filters?.ageMax !== undefined) {
      queryBuilder.andWhere('client.age <= :ageMax', { ageMax: filters.ageMax });
    }
    if (filters?.gender) {
      queryBuilder.andWhere('client.gender = :gender', { gender: filters.gender });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    return client;
  }

  async update(id: number, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.clientRepository.preload({
      id: id,
      ...updateClientDto,
    });
    if (!client) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado para actualizar`);
    }
    return this.clientRepository.save(client);
  }

  async remove(id: number): Promise<void> {
    // --- NUEVA VALIDACIÓN ---
    const appointmentsCount = await this.appointmentRepository.count({ where: { clientId: id } });
    if (appointmentsCount > 0) {
      throw new BadRequestException(`No se puede eliminar el cliente porque tiene ${appointmentsCount} citas asociadas.`);
    }
    // --- FIN NUEVA VALIDACIÓN ---

    const result = await this.clientRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado para eliminar`);
    }
  }
}
