import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Admin, Teacher, Parent, Student, ParentStudent } from '../entities';
import { UsersService } from './services/users.service';
import { StudentsService } from './services/students.service';
import { UsersController } from './controllers/users.controller';
import { StudentsController } from './controllers/students.controller';
import { ParentsController } from './controllers/parents.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Admin,
      Teacher,
      Parent,
      Student,
      ParentStudent,
    ]),
  ],
  controllers: [UsersController, StudentsController, ParentsController],
  providers: [UsersService, StudentsService],
  exports: [UsersService, StudentsService],
})
export class UsersModule {}
