import {
  Injectable,
  UnauthorizedException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, Admin } from '../entities';
import { UserRole, Gender } from '../common/enums';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  private async seedAdmin() {
    const adminUsername = this.configService.get<string>('ADMIN_USERNAME');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (!adminUsername || !adminPassword) {
      this.logger.warn('Admin credentials not found in environment variables.');
      return;
    }

    const existingAdmin = await this.userRepository.findOne({
      where: { username: adminUsername },
    });

    if (!existingAdmin) {
      this.logger.log(`Seeding initial admin user: ${adminUsername}`);
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const user = this.userRepository.create({
        username: adminUsername,
        passwordHash: hashedPassword,
        role: UserRole.ADMIN,
        gender: Gender.MALE, // Default for system admin, can be changed
      });

      const savedUser = await this.userRepository.save(user);

      const admin = this.adminRepository.create({
        userId: savedUser.id,
        fullName: this.configService.get<string>('ADMIN_FULLNAME') || 'System Admin',
        email: this.configService.get<string>('ADMIN_EMAIL') || 'admin@wissk.ac.th',
      });

      await this.adminRepository.save(admin);
      this.logger.log('Initial admin user seeded successfully.');
    }
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    const user = await this.userRepository.findOne({
      where: { username, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      gender: user.gender,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        gender: user.gender,
      },
    };
  }
}
