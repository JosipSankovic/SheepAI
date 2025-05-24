import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BankAccountController } from "./bank_account.controller";
import { BankAccount } from "./bank_account.entity";
import { BankAccountService } from "./bank_account.service";

@Module({
    imports:[TypeOrmModule.forFeature([BankAccount])],
    controllers:[BankAccountController],
    providers:[BankAccountService]
})

export class BankAccountModule{}