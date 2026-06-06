import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Visibility, GenderAccess } from '../common/enums';
import { Activity } from './activity.entity';

@Entity('photos')
export class Photo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  activityId: string;

  @ManyToOne(() => Activity, (activity) => activity.photos)
  @JoinColumn({ name: 'activityId' })
  activity: Activity;

  @Column()
  filePath: string;

  @Column({
    type: 'enum',
    enum: GenderAccess,
  })
  genderAccess: GenderAccess;

  @Column({
    type: 'enum',
    enum: Visibility,
  })
  visibility: Visibility;

  @CreateDateColumn()
  uploadedAt: Date;
}
