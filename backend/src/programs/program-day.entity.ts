import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Program } from './program.entity';
import { ProgramExercise } from './program-exercise.entity';

export enum DayType {
  WORKOUT = 'workout',
  REST = 'rest',
}

@Entity('program_days')
export class ProgramDay {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Program, (program) => program.days, { onDelete: 'CASCADE' })
  @JoinColumn()
  program: Program;

  @Column()
  dayNumber: number;

  @Column({ type: 'enum', enum: DayType, default: DayType.WORKOUT })
  type: DayType;

  @OneToMany(() => ProgramExercise, (pe) => pe.programDay, { cascade: true, eager: true })
  exercises: ProgramExercise[];
}
