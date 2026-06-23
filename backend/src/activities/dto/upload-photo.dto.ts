import { IsEnum } from 'class-validator';
import { GenderAccess, Visibility } from '../../common/enums';

export class UploadPhotoDto {
  @IsEnum(GenderAccess)
  genderAccess: GenderAccess;

  @IsEnum(Visibility)
  visibility: Visibility;
}
