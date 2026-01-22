import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 3, ttl: 300 } })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 300 } })
  @Post('refresh')
  refresh(
    @Body()
    body: {
      userId: number;
      refreshToken: string;
    },
  ) {
    return this.authService.refresh(body.userId, body.refreshToken);
  }

  @Post('logout')
  logout(
    @Body()
    body: {
      userId: number;
    },
  ) {
    return this.authService.logout(body.userId);
  }
}
