import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Card } from "./card.entity";
import { CardController } from "./card.controller";
import { CardService } from "./card.service";

@Module({
    imports:[TypeOrmModule.forFeature([Card])],
    controllers:[CardController],
    providers:[CardService]
})

export class CardModule{}