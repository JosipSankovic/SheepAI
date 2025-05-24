import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TokenBlacklist } from "./TokenBlacklist.entity";
import { LessThanOrEqual, Repository } from "typeorm";
import { TokenPayload } from "../common/common";
import { time } from "console";
import { Cron, CronExpression } from "@nestjs/schedule";


@Injectable()
export class TokenBlacklistService{
    constructor(@InjectRepository(TokenBlacklist) 
    private readonly tokenBlacklistRepository:Repository<TokenBlacklist>){}

    async storeRefreshToken(jti: string, userId: number, expiresAt: Date): Promise<TokenBlacklist> {
      // Create and save a new token record marked as not blacklisted
      const tokenEntity = this.tokenBlacklistRepository.create({
        jti,
        userId,
        expiresAt,
        blacklisted: false,
      });
      return await this.tokenBlacklistRepository.save(tokenEntity);
    }
    async blacklistToken(jti: string, userId: number, expiresAt: Date): Promise<void> {
        let tokenEntity = await this.tokenBlacklistRepository.upsert({jti,userId,expiresAt,blacklisted:true},{conflictPaths:["jti"]});
       
        // await this.tokenBlacklistRepository.save(tokenEntity);
      }

      async isTokenBlacklisted(jti: string): Promise<boolean> {
        const tokenEntity = await this.tokenBlacklistRepository.findOne({
          where: { jti },
        });
        if (!tokenEntity) {
          return false;
        }
        if (tokenEntity.blacklisted) {
          return true;
        }
        const now = new Date();
        if (tokenEntity.expiresAt <= now) {
          return true;
        }
        return false;
      }
      @Cron(CronExpression.EVERY_30_MINUTES,{name:"removeingExpiredTokens",waitForCompletion:true})
      async removeExpiredTokens(): Promise<number> {
        console.log("CRON:removig expired tokens", String(new Date().toString()))
        const now = new Date();
        const deleteResult = await this.tokenBlacklistRepository.delete({
          expiresAt: LessThanOrEqual(now)
        });
        return deleteResult.affected || 0;
      }

      async blacklistAllUserTokens(userId: number): Promise<void> {
        await this.tokenBlacklistRepository.update(
          { userId,blacklisted:false },
          { blacklisted: true }
        );
      }
      

}