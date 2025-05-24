import {  Module} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule,ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { User } from './modules/user/user.entity';
import { UserModule } from './modules/user/user.module';
import { Card } from './modules/card/card.entity';
import { BankAccount } from './modules/bank_account/bank_account.entity';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60*1000,  // Time to live (in seconds) for each request limit count
      limit: 100, // Maximum number of requests within the ttl period
    }]),
    ConfigModule.forRoot({
      isGlobal:true
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory:(configService:ConfigService)=>({
        type: 'mysql',
        host: process.env.DB_HOST||"localhost",
        username: process.env.DB_USER||"root",
        password: process.env.DB_PASSWORD||"",
        database:process.env.DB_DATABASE||"sheepai",
        timezone: 'Z',
        dateStrings: ['DATE', 'DATETIME'],// Ensure DATE and DATETIME are treated as strings
        entities: [User,Card,BankAccount],
        synchronize: true, // Be careful in production (consider setting to false)
      })
    }),
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService,{provide:APP_GUARD,useClass:ThrottlerGuard}],
})
export class AppModule {
}
