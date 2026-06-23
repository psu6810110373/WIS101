import { IsEnum, IsOptional } from 'class-validator';
import { GenderAccess, Visibility } from '../../common/enums';

export class UpdatePhotoDto {
  @IsEnum(GenderAccess)
  @IsOptional()
  genderAccess?: GenderAccess;

  @IsEnum(Visibility)
  @IsOptional()
  visibility?: Visibility;
}
