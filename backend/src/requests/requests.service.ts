import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request, RequestStatus } from './request.entity';
import { ClientsService } from '../clients/clients.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request) private requestRepo: Repository<Request>,
    private clientsService: ClientsService,
    private usersService: UsersService,
  ) {}

  async create(userId: number, coachSlug: string) {
    const client = await this.clientsService.findByUser(userId);
    if (!client) throw new NotFoundException('Complete your profile first');
    const coach = await this.usersService.findBySlug(coachSlug);
    if (!coach) throw new NotFoundException('Coach not found');

    const existing = await this.requestRepo.findOne({
      where: { client: { id: client.id }, coach: { id: coach.id } },
    });
    if (existing) return existing;

    const req = this.requestRepo.create({ client, coach, status: RequestStatus.PENDING });
    return this.requestRepo.save(req);
  }

  async findByCoach(coachId: number) {
    return this.requestRepo.find({
      where: { coach: { id: coachId } },
      relations: ['client', 'client.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByClient(userId: number) {
    const client = await this.clientsService.findByUser(userId);
    if (!client) return [];
    return this.requestRepo.find({
      where: { client: { id: client.id } },
      relations: ['coach'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: number, status: RequestStatus) {
    const req = await this.requestRepo.findOne({ where: { id } });
    if (!req) throw new NotFoundException('Request not found');
    req.status = status;
    return this.requestRepo.save(req);
  }

  findAll() {
    return this.requestRepo.find({ relations: ['client', 'client.user', 'coach'] });
  }
}
