import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Gender } from '../common/enums';
import { ParentStudent } from './parent-student.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  studentCode: string;

  @Column()
  fullName: string;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column()
  classroom: string;

  @Column()
  year: number;

  @OneToMany(() => ParentStudent, (parentStudent) => parentStudent.student)
  parentStudents: ParentStudent[];
}
