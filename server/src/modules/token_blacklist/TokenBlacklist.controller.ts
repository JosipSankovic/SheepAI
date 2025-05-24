import { Controller } from "@nestjs/common";
import { TokenBlacklistService } from "./TokenBlacklist.service";


@Controller("token_blacklist")

export class TokenBlacklistController{
    constructor(private readonly tokenBlackListService:TokenBlacklistService){}
}