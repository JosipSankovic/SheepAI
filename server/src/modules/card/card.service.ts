import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt"
import { Card } from "./card.entity";


@Injectable()
export class CardService{
    constructor(
        @InjectRepository(Card)
        private cardRepository:Repository<Card>
    ){}

}
