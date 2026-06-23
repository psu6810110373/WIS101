import { IsString, IsNotEmpty, IsEnum, IsDateString } from 'class-validator';
import { Visibility } from '../../common/enums';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsNotEmpty()
  activityDate: string;

  @IsEnum(Visibility)
  visibility: Visibility;
}
