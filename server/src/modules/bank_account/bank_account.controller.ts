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
} from '@nestjs/common';
import { Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { BankAccountService } from './bank_account.service';
@Controller('BankAccount')
export class BankAccountController {
  constructor(
    private readonly bankAccountService:BankAccountService,

  ) {}
}
