import { IsOptional, IsString, IsEnum, IsBoolean, MinLength, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../../common/enums';
import { StudentRelationDto } from './create-parent.dto';

export class UpdateParentDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentRelationDto)
  students?: StudentRelationDto[];
}
