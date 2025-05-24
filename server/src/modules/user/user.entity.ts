import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { IsDate, IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import {  Expose } from "class-transformer";
import { BankAccount } from "../bank_account/bank_account.entity";

@Entity("user")
export class User {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column()
    name: string;

    @Column()
    last_name: string;

    @Column({type:'enum',enum:["male","female"]})
    gender:'male'|'female';

    @Column({type:'date'})
    date_of_birth:Date;

    @Column({nullable:true,default:null})
    @IsOptional()
    phone_number:string;

    @Column()
    email: string;

    @Column({ type: 'varchar', length: 64 })
    password: string;

    @Column({nullable:true})
    @IsOptional()
    OIB:string;

    @OneToMany(()=>BankAccount,(bank_account)=>bank_account.user,{cascade:true})
    bank_accounts:BankAccount[];


    @Column({ nullable: true })
    parentId?: number;

    @ManyToOne(() => User, (user) => user.children, {
    nullable: true,
    onDelete: "SET NULL",
    })
    @JoinColumn({ name: "parentId" })
    parent?: User;
    @OneToMany(() => User, (user) => user.parent)
    children: User[];


}

export class UserLoginDTO{
    @Expose()
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email:string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    password:string;
}

export class UserEssencialDTO{
    @Expose()
    @IsString()
    name:string;

    @Expose()
    @IsString()
    last_name:string;

    @Expose()
    @IsDate()
    date_of_birth:Date;

}