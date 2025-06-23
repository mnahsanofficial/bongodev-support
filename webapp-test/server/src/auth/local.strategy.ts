import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    
    super({ usernameField: 'name', passwordField: 'password' });
  }

  // Passport will pass the value of the 'name' field as the first argument here.
  // The parameter name 'name' (instead of 'username') makes it clearer.
  async validate(name: string, pass: string): Promise<any> { 
    const user = await this.authService.validateUser(name, pass);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
