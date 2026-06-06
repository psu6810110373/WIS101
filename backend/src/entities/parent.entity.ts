import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Gender } from '../common/enums';
import { ParentStudent } from './parent-student.entity';

@Entity('parents')
export class Parent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @OneToOne(() => User, (user) => user.parent)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  fullName: string;

  @Column()
  phone: string;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @OneToMany(() => ParentStudent, (parentStudent) => parentStudent.parent)
  parentStudents: ParentStudent[];
}
