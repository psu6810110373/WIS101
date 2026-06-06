import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Visibility } from '../common/enums';

@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  createdById: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: Visibility,
  })
  visibility: Visibility;

  @CreateDateColumn()
  publishedAt: Date;

  @Column({ default: true })
  isActive: boolean;
}
