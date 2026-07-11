import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProgramExercise } from '../programs/program-exercise.entity';

export enum MuscleGroup {
  CHEST = 'chest',
  BACK = 'back',
  SHOULDERS = 'shoulders',
  ARMS = 'arms',
  LEGS = 'legs',
  GLUTES = 'glutes',
  CORE = 'core',
  CARDIO = 'cardio',
  FULL_BODY = 'full_body',
}

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: MuscleGroup })
  muscleGroup: MuscleGroup;

  @Column({ nullable: true })
  gifUrl: string;

  @Column({ nullable: true })
  videoUrl: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true, type: 'text' })
  instructions: string;

  @OneToMany(() => ProgramExercise, (pe) => pe.exercise)
  programExercises: ProgramExercise[];
}
