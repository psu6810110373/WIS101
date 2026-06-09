import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Gender } from '../../common/enums';

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  studentCode?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  classroom?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  year?: number;
}
