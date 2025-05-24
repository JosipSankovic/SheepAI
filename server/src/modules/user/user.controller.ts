import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  HttpStatus,
  HttpException,
  UseGuards,
  Req,
  InternalServerErrorException,
  BadRequestException,
  UnauthorizedException,
  Param,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { UserService } from './user.service';
import { User } from './user.entity';
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,

  ) {}

    @Get("/getUser/:id")
    async getUser(@Param() id:number):Promise<User>{
      let user=await this.userService.getUser(id);
      return user
    }
}
