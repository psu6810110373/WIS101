import { IsNotEmpty, IsString, IsEmail, IsEnum, MinLength } from 'class-validator';
import { Gender } from '../../common/enums';

export class CreateTeacherDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;
}
