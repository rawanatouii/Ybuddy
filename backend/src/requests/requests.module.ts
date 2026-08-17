import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request } from './request.entity';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { ClientsModule } from '../clients/clients.module';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Request]), ClientsModule, UsersModule, MailModule],
  providers: [RequestsService],
  controllers: [RequestsController],
  exports: [RequestsService],
})
export class RequestsModule {}
