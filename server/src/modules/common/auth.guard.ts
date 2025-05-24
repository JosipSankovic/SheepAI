import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { TokenUtils } from './TokenUtils';
import { TokenPayload } from './common';
import { HandleError } from './CustomErrors';
import { TokenBlacklistService } from '../token_blacklist/TokenBlacklist.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokenUtils: TokenUtils,
    private readonly tokenBlackListService:TokenBlacklistService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request & { user?: TokenPayload } = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();

    // Validate the Authorization header
    const authHeader = request.headers['authorization'];
    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('Authorization token is missing');
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Invalid authorization header format');
    }
    const accessToken = parts[1];

    // Verify the access token
    const [accessError, tokenInfo] = await HandleError(
      this.tokenUtils.verifyToken(accessToken)
    );
    if (accessError !== undefined) {
        // Determine the error type
        switch (accessError.name) {
          case "TokenExpiredError": {
            throw new UnauthorizedException("Access token is expired")
          }
          case "JsonWebTokenError": {
            throw new UnauthorizedException("Access token is invalid")
          }
          default:
            throw new UnauthorizedException('Access token verification failed');
        }
    } else {
      // Access token is valid; attach the payload
      request.user = tokenInfo.payload;
    }

    return true;
  }
}
