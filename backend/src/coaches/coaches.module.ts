import { Module } from '@nestjs/common';
import { CoachesController } from './coaches.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [CoachesController],
})
export class CoachesModule {}
