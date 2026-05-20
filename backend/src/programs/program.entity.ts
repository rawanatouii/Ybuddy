import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { Client } from '../clients/client.entity';
import { User } from '../users/user.entity';
import { ProgramDay } from './program-day.entity';

@Entity('programs')
export class Program {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Client, (client) => client.programs, { eager: true })
  @JoinColumn()
  client: Client;

  @ManyToOne(() => User, (user) => user.coachPrograms, { eager: true })
  @JoinColumn()
  coach: User;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  duration: string;

  @Column({ default: false })
  sent: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => ProgramDay, (day) => day.program, { cascade: true, eager: true })
  days: ProgramDay[];
}
