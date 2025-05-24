import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne } from "typeorm";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import {  Expose } from "class-transformer";
import { Card } from "../card/card.entity";

@Entity("bank_account")
export class BankAccount {
    @PrimaryGeneratedColumn()
    Id:number;

    @Column()
    IBAN:string;

    @Column({type:"varchar",default:"0"})
    ballance:string;

    @Column({type:"enum",enum:['euro','dollar']})
    currency:'euro'|'dollar';

    @ManyToOne(()=>Card,(card)=>card.bank_account)
    cards:Card[]
}
