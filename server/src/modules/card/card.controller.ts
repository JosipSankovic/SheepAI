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
import { CardService } from './card.service';
@Controller('card')
export class CardController {
  constructor(
    private readonly cardService: CardService,

  ) {}
}
