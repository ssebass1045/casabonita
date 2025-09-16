import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServicesPack } from './entities/services-pack.entity';
import { ClientServicesPack } from './entities/client-services-pack.entity';
import { ServicesPackSession } from './entities/services-pack-session.entity';
import { CreateServicesPackDto } from './dto/create-services-pack.dto';
import { CreateClientServicesPackDto } from './dto/create-client-services-pack.dto';


@Injectable()
export class ServicesPackService {
  constructor(
    @InjectRepository(ServicesPack)
    private servicesPackRepository: Repository<ServicesPack>,
    @InjectRepository(ClientServicesPack)
    private clientServicesPackRepository: Repository<ClientServicesPack>,
    @InjectRepository(ServicesPackSession)
    private servicesPackSessionRepository: Repository<ServicesPackSession>,
  ) {}

  async updateClientServicesPack(id: number, updateDto: CreateClientServicesPackDto): Promise<ClientServicesPack> {
    const clientPack = await this.getClientServicesPackById(id);
    if (!clientPack) {
      throw new NotFoundException(`Paquete del cliente con ID ${id} no encontrado`);
    }

    Object.assign(clientPack, updateDto);
    return this.clientServicesPackRepository.save(clientPack);
  }

  async getAllClientServicesPacks(): Promise<ClientServicesPack[]> {
    return this.clientServicesPackRepository.find({
      relations: ['client', 'servicesPack'],
      where: { isActive: true }
    });
  }

  async getClientServicesPackById(id: number): Promise<ClientServicesPack | null> {
    return this.clientServicesPackRepository.findOne({
      where: { id },
      relations: ['client', 'servicesPack']
    });
  }

  async createClientServicesPack(createDto: CreateClientServicesPackDto): Promise<ClientServicesPack> {
    const clientPack = this.clientServicesPackRepository.create({
      ...createDto,
      sessionsUsed: 0,
      sessionsRemaining: createDto.sessionsRemaining || 0,
      amountPaid: createDto.amountPaid || 0,
      isActive: true,
      purchaseDate: new Date()
    });
    
    return this.clientServicesPackRepository.save(clientPack);
  }


  // Métodos CRUD para ServicesPack
  async getAllServicesPacks(): Promise<ServicesPack[]> {
    return this.servicesPackRepository.find();
  }

  async getServicesPackById(id: number): Promise<ServicesPack | null> {
    return this.servicesPackRepository.findOne({ where: { id } });
  }

  async createServicesPack(createDto: CreateServicesPackDto): Promise<ServicesPack> {
    const pack = this.servicesPackRepository.create({
      ...createDto,
      isActive: createDto.isActive ?? true,
    });
    return this.servicesPackRepository.save(pack);
  }

  async updateServicesPack(id: number, updateDto: CreateServicesPackDto): Promise<ServicesPack> {
    const pack = await this.getServicesPackById(id);
    if (!pack) {
      throw new NotFoundException(`Paquete con ID ${id} no encontrado`);
    }

    Object.assign(pack, updateDto);
    return this.servicesPackRepository.save(pack);
  }

  async deleteServicesPack(id: number): Promise<void> {
    const pack = await this.getServicesPackById(id);
    if (!pack) {
      throw new NotFoundException(`Paquete con ID ${id} no encontrado`);
    }

    await this.servicesPackRepository.remove(pack);
  }

  // Métodos existentes para sesiones
  async createServicesPackSession(
    clientServicesPackId: number,
    employeeId: number,
    employeePayment: number,
    notes?: string,
  ): Promise<ServicesPackSession> {
    const clientPack = await this.clientServicesPackRepository.findOne({
      where: { id: clientServicesPackId },
    });

    if (!clientPack) {
      throw new NotFoundException('Paquete del cliente no encontrado');
    }

    if (clientPack.sessionsRemaining <= 0) {
      throw new BadRequestException('No hay sesiones disponibles en este paquete');
    }

    const session = this.servicesPackSessionRepository.create({
      clientServicesPackId,
      employeeId,
      employeePayment,
      sessionDate: new Date(),
      notes,
    });

    // Actualizar contador de sesiones
    clientPack.sessionsUsed += 1;
    clientPack.sessionsRemaining -= 1;

    await this.clientServicesPackRepository.save(clientPack);
    return this.servicesPackSessionRepository.save(session);
  }

  async getEmployeePackSessions(
    employeeId: number,
    startDate: string,
    endDate: string,
  ): Promise<ServicesPackSession[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);

    return this.servicesPackSessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.clientServicesPack', 'clientPack')
      .leftJoinAndSelect('clientPack.servicesPack', 'pack')
      .leftJoinAndSelect('clientPack.client', 'client')
      .where('session.employeeId = :employeeId', { employeeId })
      .andWhere('session.sessionDate BETWEEN :start AND :end', { start, end })
      .getMany();
  }
}