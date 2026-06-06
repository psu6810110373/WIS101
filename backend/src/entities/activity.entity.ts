import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Visibility } from '../common/enums';
import { Photo } from './photo.entity';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  createdById: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  activityDate: Date;

  @Column({
    type: 'enum',
    enum: Visibility,
  })
  visibility: Visibility;

  @OneToMany(() => Photo, (photo) => photo.activity)
  photos: Photo[];
}
