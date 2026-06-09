import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole, Gender } from '../../common/enums';

/**
 * Note: This Guard is a generic check. 
 * specific photo filtering should happen in the service layer, 
 * but this ensures the user has the correct session data.
 */
@Injectable()
export class GenderGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      return false;
    }

    // Admins bypass gender checks
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Teachers and Parents MUST have a gender defined in their session to access protected media
    if (!user.gender || (user.gender !== Gender.MALE && user.gender !== Gender.FEMALE)) {
      throw new ForbiddenException('User gender not identified for this restricted content.');
    }

    return true;
  }
}
