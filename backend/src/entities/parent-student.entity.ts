import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Parent } from './parent.entity';
import { Student } from './student.entity';

@Entity('parent_students')
export class ParentStudent {
  @PrimaryColumn()
  parentId: string;

  @PrimaryColumn()
  studentId: string;

  @Column()
  relationship: string;

  @ManyToOne(() => Parent, (parent) => parent.parentStudents)
  @JoinColumn({ name: 'parentId' })
  parent: Parent;

  @ManyToOne(() => Student, (student) => student.parentStudents)
  @JoinColumn({ name: 'studentId' })
  student: Student;
}
