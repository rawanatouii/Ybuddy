import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise, MuscleGroup } from './exercise.entity';

@Injectable()
export class ExercisesService {
  constructor(@InjectRepository(Exercise) private exerciseRepo: Repository<Exercise>) {}

  create(data: Partial<Exercise>) {
    const ex = this.exerciseRepo.create(data);
    return this.exerciseRepo.save(ex);
  }

  findAll(muscleGroup?: MuscleGroup) {
    if (muscleGroup) return this.exerciseRepo.find({ where: { muscleGroup } });
    return this.exerciseRepo.find();
  }

  async findById(id: number) {
    const ex = await this.exerciseRepo.findOne({ where: { id } });
    if (!ex) throw new NotFoundException('Exercise not found');
    return ex;
  }

  async update(id: number, data: Partial<Exercise>) {
    await this.findById(id);
    await this.exerciseRepo.update(id, data);
    return this.findById(id);
  }

  async remove(id: number) {
    await this.findById(id);
    return this.exerciseRepo.delete(id);
  }
}
