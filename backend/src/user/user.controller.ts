import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';
import { User as UserDecorator } from '../auth/decorators/user.decorator';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('users/me')
  getMe(@UserDecorator('id') userId: number) {
    return this.userService.getMe(userId);
  }

  @Roles(Role.ADMIN)
  @Get('admin/users')
  getAllUsers() {
    return this.userService.getAllUsers();
  }
}
