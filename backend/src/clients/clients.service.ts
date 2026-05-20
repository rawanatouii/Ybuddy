import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ClientsService {
  constructor(@InjectRepository(Client) private clientRepo: Repository<Client>) {}

  async createOrUpdate(user: User, data: Partial<Client>) {
    let client = await this.clientRepo.findOne({ where: { user: { id: user.id } }, relations: ['user'] });
    if (!client) {
      client = this.clientRepo.create({ ...data, user });
    } else {
      Object.assign(client, data);
    }
    return this.clientRepo.save(client);
  }

  async findByUser(userId: number) {
    return this.clientRepo.findOne({ where: { user: { id: userId } }, relations: ['user'] });
  }

  async findById(id: number) {
    const client = await this.clientRepo.findOne({ where: { id }, relations: ['user'] });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  findAll() {
    return this.clientRepo.find({ relations: ['user'] });
  }
}
