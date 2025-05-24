import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt"
import { BankAccount } from "./bank_account.entity";


@Injectable()
export class BankAccountService{
    constructor(
        @InjectRepository(BankAccount)
        private bankAccountRepository:Repository<BankAccount>
    ){}

}
