import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { TokenUtils } from "../common/TokenUtils";
import { AuthGuard } from "../common/auth.guard";
import { TokenBlacklistService } from "../token_blacklist/TokenBlacklist.service";
import { TokenBlacklist } from "../token_blacklist/TokenBlacklist.entity";

@Module({
    imports:[TypeOrmModule.forFeature([User,TokenBlacklist])],
    controllers:[UserController],
    providers:[UserService,TokenUtils,AuthGuard,TokenBlacklistService,TokenUtils]
})

export class UserModule{}