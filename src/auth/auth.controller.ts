import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';
import { UserDto } from './models/user.dto';
import { User } from './models/user.interface';
import { JwtService } from '@nestjs/jwt';
import { AuthInterceptor } from './auth.interceptor';
import { MailerService } from '@nestjs-modules/mailer';

@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  @Post('register')
  async register(@Body() body: UserDto) {
    const hash = await bcrypt.hash(body.password, 12);

    return this.authService.create({
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      password: hash,
    });
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) response,
  ): Promise<any> {
    const user = await this.authService.findOneBy({ email });
    if (!user) {
      throw new BadRequestException("User Doesn't exists");
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('Invalid Credentials');
    }

    response.cookie('jwt', await this.jwtService.signAsync({ ...user }), {
      httpOnly: true,
    });
    return JSON.stringify({
      user: user,
    });
  }

  @UseInterceptors(AuthInterceptor)
  @Get('user')
  async user(@Req() request) {
    const data = request.cookies['jwt'];
    return {
      ...(await this.jwtService.verifyAsync(data)),
      jwt: data,
    };
  }

  @UseInterceptors(AuthInterceptor)
  @Post('logout')
  async logout(@Res({ passthrough: true }) response) {
    const data = response.clearCookie('jwt');
    await this.mailerService.sendMail({
      to: 'monthedjeumoubrice@gmail.com',
      subject: 'Test',
      html: 'Hello World',
    });

    return {
      message: 'Success Logout',
    };
  }
}
