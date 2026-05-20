import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ProgramDay } from './program-day.entity';
import { Exercise } from '../exercises/exercise.entity';

@Entity('program_exercises')
export class ProgramExercise {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProgramDay, (day) => day.exercises, { onDelete: 'CASCADE' })
  @JoinColumn()
  programDay: ProgramDay;

  @ManyToOne(() => Exercise, (ex) => ex.programExercises, { eager: true })
  @JoinColumn()
  exercise: Exercise;

  @Column({ default: 3 })
  sets: number;

  @Column({ default: 10 })
  reps: number;
}
