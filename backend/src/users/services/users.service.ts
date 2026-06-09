import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, Teacher, Parent, Student, ParentStudent, Admin } from '../../entities';
import { UserRole } from '../../common/enums';
import { CreateTeacherDto } from '../dto/create-teacher.dto';
import { UpdateTeacherDto } from '../dto/update-teacher.dto';
import { CreateParentDto } from '../dto/create-parent.dto';
import { UpdateParentDto } from '../dto/update-parent.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(Parent)
    private readonly parentRepository: Repository<Parent>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(ParentStudent)
    private readonly parentStudentRepository: Repository<ParentStudent>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(role?: UserRole): Promise<User[]> {
    const findOptions: any = {
      relations: {
        admin: true,
        teacher: true,
        parent: {
          parentStudents: {
            student: true,
          },
        },
      },
    };
    if (role) {
      findOptions.where = { role };
    }
    const users = await this.userRepository.find(findOptions);
    return users.map((user) => {
      delete (user as any).passwordHash;
      return user;
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        admin: true,
        teacher: true,
        parent: {
          parentStudents: {
            student: true,
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    delete (user as any).passwordHash;
    return user;
  }

  async createTeacher(createTeacherDto: CreateTeacherDto): Promise<User> {
    const { username, password, fullName, subject, email, gender } = createTeacherDto;

    const existingUser = await this.userRepository.findOne({ where: { username } });
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const existingEmail = await this.teacherRepository.findOne({ where: { email } });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = queryRunner.manager.create(User, {
        username,
        passwordHash: hashedPassword,
        role: UserRole.TEACHER,
        gender,
      });
      const savedUser = await queryRunner.manager.save(User, user);

      const teacher = queryRunner.manager.create(Teacher, {
        userId: savedUser.id,
        fullName,
        subject,
        email,
      });
      await queryRunner.manager.save(Teacher, teacher);

      await queryRunner.commitTransaction();
      return this.findOne(savedUser.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async updateTeacher(id: string, updateTeacherDto: UpdateTeacherDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { teacher: true },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    if (user.role !== UserRole.TEACHER) {
      throw new BadRequestException('User is not a teacher');
    }

    const { fullName, subject, email, gender, isActive, password } = updateTeacherDto;

    if (email && user.teacher && email !== user.teacher.email) {
      const existingEmail = await this.teacherRepository.findOne({ where: { email } });
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (password) {
        user.passwordHash = await bcrypt.hash(password, 10);
      }
      if (gender !== undefined) user.gender = gender;
      if (isActive !== undefined) user.isActive = isActive;
      await queryRunner.manager.save(User, user);

      if (user.teacher) {
        if (fullName !== undefined) user.teacher.fullName = fullName;
        if (subject !== undefined) user.teacher.subject = subject;
        if (email !== undefined) user.teacher.email = email;
        await queryRunner.manager.save(Teacher, user.teacher);
      }

      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async createParent(createParentDto: CreateParentDto): Promise<User> {
    const { username, password, fullName, phone, gender, students } = createParentDto;

    const existingUser = await this.userRepository.findOne({ where: { username } });
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    if (students && students.length > 0) {
      for (const rel of students) {
        const student = await this.studentRepository.findOne({ where: { id: rel.studentId } });
        if (!student) {
          throw new NotFoundException(`Student with ID ${rel.studentId} not found`);
        }
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = queryRunner.manager.create(User, {
        username,
        passwordHash: hashedPassword,
        role: UserRole.PARENT,
        gender,
      });
      const savedUser = await queryRunner.manager.save(User, user);

      const parent = queryRunner.manager.create(Parent, {
        userId: savedUser.id,
        fullName,
        phone,
        gender,
      });
      const savedParent = await queryRunner.manager.save(Parent, parent);

      if (students && students.length > 0) {
        const parentStudents = students.map((rel) => {
          return queryRunner.manager.create(ParentStudent, {
            parentId: savedParent.id,
            studentId: rel.studentId,
            relationship: rel.relationship,
          });
        });
        await queryRunner.manager.save(ParentStudent, parentStudents);
      }

      await queryRunner.commitTransaction();
      return this.findOne(savedUser.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async updateParent(id: string, updateParentDto: UpdateParentDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { parent: true },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    if (user.role !== UserRole.PARENT) {
      throw new BadRequestException('User is not a parent');
    }

    const { fullName, phone, gender, isActive, password, students } = updateParentDto;

    if (students && students.length > 0) {
      for (const rel of students) {
        const student = await this.studentRepository.findOne({ where: { id: rel.studentId } });
        if (!student) {
          throw new NotFoundException(`Student with ID ${rel.studentId} not found`);
        }
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (password) {
        user.passwordHash = await bcrypt.hash(password, 10);
      }
      if (gender !== undefined) user.gender = gender;
      if (isActive !== undefined) user.isActive = isActive;
      await queryRunner.manager.save(User, user);

      if (user.parent) {
        if (fullName !== undefined) user.parent.fullName = fullName;
        if (phone !== undefined) user.parent.phone = phone;
        if (gender !== undefined) user.parent.gender = gender;
        await queryRunner.manager.save(Parent, user.parent);

        if (students !== undefined) {
          await queryRunner.manager.delete(ParentStudent, { parentId: user.parent.id });

          if (students.length > 0) {
            const parentStudents = students.map((rel) => {
              return queryRunner.manager.create(ParentStudent, {
                parentId: user.parent.id,
                studentId: rel.studentId,
                relationship: rel.relationship,
              });
            });
            await queryRunner.manager.save(ParentStudent, parentStudents);
          }
        }
      }

      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        admin: true,
        teacher: true,
        parent: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (user.role === UserRole.TEACHER && user.teacher) {
        await queryRunner.manager.delete(Teacher, { id: user.teacher.id });
      } else if (user.role === UserRole.PARENT && user.parent) {
        await queryRunner.manager.delete(ParentStudent, { parentId: user.parent.id });
        await queryRunner.manager.delete(Parent, { id: user.parent.id });
      } else if (user.role === UserRole.ADMIN && user.admin) {
        await queryRunner.manager.delete(Admin, { id: user.admin.id });
      }

      await queryRunner.manager.delete(User, { id });
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findMyChildren(userId: string): Promise<any[]> {
    const parent = await this.parentRepository.findOne({
      where: { userId },
      relations: {
        parentStudents: {
          student: true,
        },
      },
    });
    if (!parent) {
      throw new NotFoundException('Parent profile not found');
    }
    return parent.parentStudents.map((ps) => ({
      ...ps.student,
      relationship: ps.relationship,
    }));
  }
}
