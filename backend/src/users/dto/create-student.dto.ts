import { IsNotEmpty, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Gender } from '../../common/enums';

export class CreateStudentDto {
  @IsNotEmpty()
  @IsString()
  studentCode: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @IsNotEmpty()
  @IsString()
  classroom: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  year: number;
}
