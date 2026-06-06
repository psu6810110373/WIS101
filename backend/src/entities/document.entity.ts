import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AccessRole } from '../common/enums';
import { Teacher } from './teacher.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  uploadedById: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.documents)
  @JoinColumn({ name: 'uploadedById' })
  teacher: Teacher;

  @Column()
  title: string;

  @Column()
  filePath: string;

  @Column({
    type: 'enum',
    enum: AccessRole,
  })
  accessRole: AccessRole;

  @CreateDateColumn()
  uploadedAt: Date;
}
