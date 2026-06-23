import { IsString, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { Visibility } from '../../common/enums';

export class UpdateAnnouncementDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(Visibility)
  @IsOptional()
  visibility?: Visibility;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
