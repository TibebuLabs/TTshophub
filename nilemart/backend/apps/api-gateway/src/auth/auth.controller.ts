import { Body, Controller, Get, Inject, Patch, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { call, CMD, JwtUser, SVC } from '@app/common';
import { Auth, CurrentUser } from '../core/auth.guard';
import { LoginDto, PasswordDto, ProfileDto, RegisterDto } from '../dto';

// ─── Auth controller (gateway) ────────────────────────────────────────────────
//
// Exposes public and authenticated auth endpoints.
// All business logic lives in auth-service.
//

@Controller('auth')
export class AuthController {
  constructor(@Inject(SVC.AUTH) private readonly auth: ClientProxy) {}

  /** Register a new customer or admin account. */
  @Post('register')
  register(@Body() data: RegisterDto) {
    return call(this.auth, CMD.auth.register, data);
  }

  /** Sign in with email + password and receive a JWT token. */
  @Post('login')
  login(@Body() data: LoginDto) {
    return call(this.auth, CMD.auth.login, data);
  }

  /** Return the signed-in user's profile. */
  @Get('me')
  @Auth()
  me(@CurrentUser() user: JwtUser) {
    return call(this.auth, CMD.auth.me, { id: user.sub });
  }

  /** Update the signed-in user's name and phone. */
  @Patch('profile')
  @Auth()
  profile(@CurrentUser() user: JwtUser, @Body() data: ProfileDto) {
    return call(this.auth, CMD.auth.profile, { id: user.sub, ...data });
  }

  /** Change the signed-in user's password. */
  @Patch('password')
  @Auth()
  password(@CurrentUser() user: JwtUser, @Body() data: PasswordDto) {
    return call(this.auth, CMD.auth.password, { id: user.sub, ...data });
  }
}
