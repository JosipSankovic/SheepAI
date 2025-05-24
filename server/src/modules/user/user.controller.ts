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
import { User, UserEssencialDTO, UserLoginDTO } from './user.entity';
import { TokenUtils } from '../common/TokenUtils';
import { TokenBlacklistService } from '../token_blacklist/TokenBlacklist.service';
import { HandleError } from '../common/CustomErrors';
import { AuthGuard } from '../common/auth.guard';
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly tokenUtils:TokenUtils,
    private readonly tokenBlacklistService:TokenBlacklistService

  ) {}

    @Get("/getUser/:id")
    async getUser(@Param() id:number):Promise<User>{
      let user=await this.userService.getUser(id);
      return user
    }

    @Post("/login")
    @Throttle({default:{limit:10,ttl:60*1000}})
    async login(@Body() user:UserLoginDTO,@Res() res:Response):Promise<Response>{
      let result:User=await this.userService.loginUser(user);
      const accessToken: string = this.tokenUtils.generateAccessToken(result);
      const refreshToken: string = this.tokenUtils.generateRefreshToken(result);
      const decodedRefresh: any = await this.tokenUtils.verifyToken(refreshToken);  
      const jti = decodedRefresh?.jti;
      const exp = decodedRefresh?.exp;
      if (jti && exp) {
        const expiresAt = new Date(exp * 1000); // convert exp (in seconds) to a JS Date
        await this.tokenBlacklistService.storeRefreshToken(jti, result.Id, expiresAt);}

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1 * 24 * 60 * 60 * 1000,
        path: '/', // ensure this is included if needed
      });

      const userDTO=plainToInstance(UserEssencialDTO,result,{excludeExtraneousValues:true})
      return res.status(200).json({
        token:accessToken,
        user:{...user}
      })

    }

    @Post('/refreshToken')
  async refreshToken(
    @Req() request: Request,
    @Res() res: Response,
  ): Promise<Response> {
    const oldrefreshToken = request.cookies?.refreshToken;
    if (!oldrefreshToken)
      return res
        .status(401)
        .json({
          code: 'REFRESH_TOKEN_MISSING',
          message: 'Refresh token is missing',
        });
    const [verifyError, decodedToken] = await HandleError(
      this.tokenUtils.verifyToken(oldrefreshToken),
    );
    if(verifyError){
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/', // ensure this is included if needed
      });

      if (verifyError?.name == 'TokenExpiredError') {
        return res
          .status(401)
          .json({
            code: 'REFRESH_TOKEN_EXPIRED',
            message: 'Refresh token is expired',
          });
      }else{
        return res
        .status(401)
        .json({
          code: 'REFRESH_TOKEN_TAMPERED',
          message: 'Refresh token has been tampered with',
        });
      }
    }
    const { payload, exp,jti } = decodedToken;
    if (!jti) {
      // If there's no jti, treat as invalid
      return res.status(401).json({
        code: 'INVALID_TOKEN_FORMAT',
        message: 'Refresh token is missing jti',
      });
    }
    const isBlacklisted = await this.tokenBlacklistService.isTokenBlacklisted(jti);
    if (isBlacklisted) {
      // Clear cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });
      return res.status(401).json({
        code: 'REFRESH_TOKEN_BLACKLISTED',
        message: 'Refresh token is invalid (blacklisted)',
      });
    }
    const newAccessToken = this.tokenUtils.generateAccessToken(
      decodedToken?.payload as User,
    );
    
    const oldTokenExpiresAt = new Date(exp * 1000);
    const userId = payload.Id;
    await this.tokenBlacklistService.blacklistToken(jti, userId, oldTokenExpiresAt);
    const newRefreshToken = this.tokenUtils.generateRefreshToken(
      decodedToken?.payload as User,
    );
    console.log("token generated")
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1 * 24 * 60 * 60 * 1000,
      path: '/', // ensure this is included if needed
    });
    return res.json({ token: newAccessToken });
  }

  @Post('/logout')
  @UseGuards(AuthGuard)
  async logout(
    @Req() request: Request,
    @Res() res: Response,
  ): Promise<Response> {
    const refreshToken = request.cookies?.refreshToken;
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/', // ensure this is included if needed
    });
    if (refreshToken) {
      const decoded: any = await this.tokenUtils.verifyToken(refreshToken); // or verify if you prefer
      if (decoded?.jti && decoded?.exp) {
        // Convert exp (seconds from epoch) to JavaScript Date
        const expiresAt = new Date(decoded.exp * 1000);
        // blacklist it in DB
        await this.tokenBlacklistService.blacklistToken(
          decoded.jti,
          decoded.sub || 0,   // userId
          expiresAt
        );
      }
    }
    return res
      .status(200)
      .json({
        code: 'LOGOUT_SUCCESS',
        message: 'Succesfully loged out',
      });
  }
}
