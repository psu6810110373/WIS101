import { IsNotEmpty, IsString, IsEnum, MinLength, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../../common/enums';

export class StudentRelationDto {
  @IsNotEmpty()
  @IsUUID()
  studentId: string;

  @IsNotEmpty()
  @IsString()
  relationship: string;
}

export class CreateParentDto {
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
  phone: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentRelationDto)
  students: StudentRelationDto[];
}
