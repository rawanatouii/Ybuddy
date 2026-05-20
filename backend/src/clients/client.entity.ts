import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';
import { Request } from '../requests/request.entity';
import { Program } from '../programs/program.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.client)
  @JoinColumn()
  user: User;

  @Column()
  name: string;

  @Column({ nullable: true })
  age: number;

  @Column({ nullable: true, type: 'float' })
  height: number;

  @Column({ nullable: true, type: 'float' })
  weight: number;

  @Column({ nullable: true })
  goal: string;

  @Column({ nullable: true })
  work: string;

  @Column({ nullable: true })
  diseases: string;

  @Column({ nullable: true })
  injuries: string;

  @Column({ nullable: true })
  activityLevel: string;

  @Column({ nullable: true })
  diet: string;

  @Column({ nullable: true })
  workoutFrequency: number;

  @OneToMany(() => Request, (req) => req.client)
  requests: Request[];

  @OneToMany(() => Program, (prog) => prog.client)
  programs: Program[];
}
