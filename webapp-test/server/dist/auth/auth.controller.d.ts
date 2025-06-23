import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserService } from '../user/user.service';
export declare class AuthController {
    private readonly authService;
    private readonly userService;
    constructor(authService: AuthService, userService: UserService);
    login(req: any, loginDto: LoginDto): Promise<{
        access_token: string;
    }>;
    register(registerDto: RegisterDto): Promise<Omit<import("../entities/user.entity").User, "password">>;
    getProfile(req: any): Promise<import("../entities/user.entity").User>;
}
