import { IsString, IsEnum, IsOptional } from 'class-validator';
import { AccessRole } from '../../common/enums';

export class UpdateDocumentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(AccessRole)
  @IsOptional()
  accessRole?: AccessRole;
}
