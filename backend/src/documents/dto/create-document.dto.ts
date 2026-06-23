import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { AccessRole } from '../../common/enums';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(AccessRole)
  accessRole: AccessRole;
}
