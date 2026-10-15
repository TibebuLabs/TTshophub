import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CMD } from '@app/common';
import { AuthService } from './auth.service';

/**
 * Exposes AuthService methods as TCP MessagePattern handlers.
 * All validation and business logic lives in AuthService.
 */
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(CMD.auth.register)
  register(@Payload() data: any) {
    return this.authService.register(data);
  }

  @MessagePattern(CMD.auth.login)
  login(@Payload() data: any) {
    return this.authService.login(data);
  }

  @MessagePattern(CMD.auth.me)
  me(@Payload() data: { id: string }) {
    return this.authService.me(data.id);
  }

  @MessagePattern(CMD.auth.list)
  list() {
    return this.authService.list();
  }

  @MessagePattern(CMD.auth.create)
  create(@Payload() data: any) {
    return this.authService.create(data);
  }

  @MessagePattern(CMD.auth.update)
  update(@Payload() data: any) {
    return this.authService.update(data);
  }

  @MessagePattern(CMD.auth.suspend)
  suspend(@Payload() data: any) {
    return this.authService.suspend(data);
  }

  @MessagePattern(CMD.auth.resetPassword)
  reset(@Payload() data: { id: string }) {
    return this.authService.resetPassword(data.id);
  }

  @MessagePattern(CMD.auth.remove)
  remove(@Payload() data: { id: string }) {
    return this.authService.remove(data.id);
  }

  @MessagePattern(CMD.auth.profile)
  profile(@Payload() data: any) {
    return this.authService.profile(data);
  }

  @MessagePattern(CMD.auth.password)
  password(@Payload() data: any) {
    return this.authService.password(data);
  }
}
