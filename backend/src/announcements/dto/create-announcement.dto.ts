import { IsString, IsNotEmpty, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { Visibility } from '../../common/enums';

export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsEnum(Visibility)
  visibility!: Visibility;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
