import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from './program.entity';
import { ProgramDay, DayType } from './program-day.entity';
import { ProgramExercise } from './program-exercise.entity';
import { ClientsService } from '../clients/clients.service';
import { ExercisesService } from '../exercises/exercises.service';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program) private programRepo: Repository<Program>,
    @InjectRepository(ProgramDay) private dayRepo: Repository<ProgramDay>,
    @InjectRepository(ProgramExercise) private peRepo: Repository<ProgramExercise>,
    private clientsService: ClientsService,
    private exercisesService: ExercisesService,
  ) {}

  async createProgram(coachId: number, clientId: number, data: { startDate?: Date; duration?: string; days: number }) {
    const client = await this.clientsService.findById(clientId);
    const program = this.programRepo.create({
      client,
      coach: { id: coachId } as any,
      startDate: data.startDate,
      duration: data.duration,
    });
    const saved = await this.programRepo.save(program);

    const days: ProgramDay[] = [];
    for (let i = 1; i <= data.days; i++) {
      const day = this.dayRepo.create({ program: saved, dayNumber: i, type: DayType.WORKOUT });
      days.push(await this.dayRepo.save(day));
    }
    return this.findById(saved.id);
  }

  async addExerciseToDay(dayId: number, exerciseId: number, sets: number, reps: number) {
    const exercise = await this.exercisesService.findById(exerciseId);
    const day = await this.dayRepo.findOne({ where: { id: dayId } });
    if (!day) throw new NotFoundException('Day not found');
    const pe = this.peRepo.create({ programDay: day, exercise, sets, reps });
    return this.peRepo.save(pe);
  }

  async removeExerciseFromDay(peId: number) {
    return this.peRepo.delete(peId);
  }

  async setDayType(dayId: number, type: DayType) {
    await this.dayRepo.update(dayId, { type });
    return this.dayRepo.findOne({ where: { id: dayId } });
  }

  async sendToClient(programId: number) {
    await this.programRepo.update(programId, { sent: true });
    return this.findById(programId);
  }

  async findById(id: number) {
    const prog = await this.programRepo.findOne({
      where: { id },
      relations: ['client', 'client.user', 'coach', 'days', 'days.exercises', 'days.exercises.exercise'],
    });
    if (!prog) throw new NotFoundException('Program not found');
    return prog;
  }

  async findByCoach(coachId: number) {
    return this.programRepo.find({
      where: { coach: { id: coachId } },
      relations: ['client', 'client.user', 'days'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByClient(userId: number) {
    const client = await this.clientsService.findByUser(userId);
    if (!client) return [];
    return this.programRepo.find({
      where: { client: { id: client.id }, sent: true },
      relations: ['coach', 'days', 'days.exercises', 'days.exercises.exercise'],
      order: { createdAt: 'DESC' },
    });
  }

  findAll() {
    return this.programRepo.find({ relations: ['client', 'coach'] });
  }
}
