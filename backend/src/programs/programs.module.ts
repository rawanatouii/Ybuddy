import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Program } from './program.entity';
import { ProgramDay } from './program-day.entity';
import { ProgramExercise } from './program-exercise.entity';
import { ProgramsService } from './programs.service';
import { ProgramsController } from './programs.controller';
import { ClientsModule } from '../clients/clients.module';
import { ExercisesModule } from '../exercises/exercises.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Program, ProgramDay, ProgramExercise]), ClientsModule, ExercisesModule, MailModule],
  providers: [ProgramsService],
  controllers: [ProgramsController],
  exports: [ProgramsService],
})
export class ProgramsModule {}
