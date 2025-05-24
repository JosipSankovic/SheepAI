import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BankAccount } from "../bank_account/bank_account.entity";



@Entity("card")
export class Card{

    @PrimaryGeneratedColumn()
    Id:number;

    @Column({type:'varchar',length:16})
    card_number:string;

    @Column({type:'date'})
    expiration_date:Date;

    @Column({type:'enum',enum:['mastercard','visa', 'maestro']})
    card_type:'mastercard'|'visa'|'maestro';

    @Column({type:"varchar",length:3})
    CVV:string;

    @Column({type:"boolean",default:false})
    activated:boolean;

    @ManyToOne(()=>BankAccount,(bank_account)=>bank_account.cards)
    bank_account:BankAccount;



}