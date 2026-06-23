import { IsString, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { Visibility } from '../../common/enums';

export class UpdateActivityDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  activityDate?: string;

  @IsEnum(Visibility)
  @IsOptional()
  visibility?: Visibility;
}
