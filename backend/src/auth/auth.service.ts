import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly redis: RedisService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (exists) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const userCount = await this.prisma.user.count();

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: userCount === 0 ? 'ADMIN' : 'USER',
      },
    });

    if (userCount === 0) {
      console.log('Admin is Created');
    } else {
      console.log(`${dto.email} Registered`);
    }

    return this.issueTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.password);

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log(`User ${dto.email} Logged In`);

    return this.issueTokens(user.id, user.email, user.role);
  }

  async refresh(userId: number, refreshToken: string) {
    const stored = await this.redis.get(`refresh:user:${userId}`);

    if (!stored || stored !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.redis.del(`refresh:user:${userId}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    console.log(`${user.email} Token Refreshed`);

    return this.issueTokens(user.id, user.email, user.role);
  }

  async logout(userId: number) {
    await this.redis.del(`refresh:user:${userId}`);
    console.log(`${userId} Token Deleted & Logged Out`);
    return { message: 'Logged out successfully' };
  }

  private async issueTokens(userId: number, email: string, role: string) {
    const accessToken = this.jwt.sign(
      {
        sub: userId,
        email,
        role,
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: Number(process.env.JWT_ACCESS_EXPIRES_IN),
      },
    );

    const refreshToken = randomUUID();

    await this.redis.set(
      `refresh:user:${userId}`,
      refreshToken,
      Number(process.env.JWT_REFRESH_EXPIRES_SECONDS),
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
