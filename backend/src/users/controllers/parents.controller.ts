import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@Controller('parents')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PARENT)
export class ParentsController {
  constructor(private readonly usersService: UsersService) {}

  @Get('my-children')
  async getMyChildren(@Req() req: any) {
    const userId = req.user.userId;
    return this.usersService.findMyChildren(userId);
  }
}
