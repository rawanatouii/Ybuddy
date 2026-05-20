import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Client } from '../clients/client.entity';
import { Program } from '../programs/program.entity';
import { Request } from '../requests/request.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Client, Program, Request])],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
