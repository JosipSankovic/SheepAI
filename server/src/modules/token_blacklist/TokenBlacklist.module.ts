import { Module } from "@nestjs/common";
import { TokenBlacklist } from "./TokenBlacklist.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TokenBlacklistController } from "./TokenBlacklist.controller";
import { TokenBlacklistService } from "./TokenBlacklist.service";


@Module({
    imports:[TypeOrmModule.forFeature([TokenBlacklist])],
    controllers:[TokenBlacklistController],
    providers:[TokenBlacklistService],
    exports:[TokenBlacklistService]
})

export class TokenBlacklistModule{};