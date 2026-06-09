import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../../entities';
import { CreateStudentDto } from '../dto/create-student.dto';
import { UpdateStudentDto } from '../dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async findAll(): Promise<Student[]> {
    return this.studentRepository.find({
      relations: {
        parentStudents: {
          parent: true,
        },
      },
    });
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: {
        parentStudents: {
          parent: true,
        },
      },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const { studentCode } = createStudentDto;
    const existing = await this.studentRepository.findOne({ where: { studentCode } });
    if (existing) {
      throw new ConflictException(`Student with code ${studentCode} already exists`);
    }
    const student = this.studentRepository.create(createStudentDto);
    return this.studentRepository.save(student);
  }

  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(id);
    if (updateStudentDto.studentCode && updateStudentDto.studentCode !== student.studentCode) {
      const existing = await this.studentRepository.findOne({
        where: { studentCode: updateStudentDto.studentCode },
      });
      if (existing) {
        throw new ConflictException(`Student with code ${updateStudentDto.studentCode} already exists`);
      }
    }
    Object.assign(student, updateStudentDto);
    return this.studentRepository.save(student);
  }

  async remove(id: string): Promise<void> {
    const student = await this.findOne(id);
    await this.studentRepository.remove(student);
  }
}
