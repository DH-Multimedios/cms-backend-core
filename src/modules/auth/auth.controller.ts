import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../../database/entities/user.entity';
import { UserResponseDto } from '../users/dto/user-response.dto';

@ApiTags('Auth')
@UseGuards(JwtAuthGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login con email y password' })
  login(@CurrentUser() user: User, @Req() req: Request, @Body() _dto: LoginDto) {
    return this.authService.login(
      user,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Obtener nuevo access token usando refresh token' })
  refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    return this.authService.refresh(
      dto.refreshToken,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión (revoca el refresh token)' })
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Post('logout-all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar todas las sesiones del usuario' })
  logoutAll(@CurrentUser() user: User) {
    return this.authService.logoutAll(user.id);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener usuario actual' })
  me(@CurrentUser() user: User): UserResponseDto {
    return UserResponseDto.from(user);
  }
}
