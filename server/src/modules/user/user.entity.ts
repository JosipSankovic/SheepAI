import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import {  Expose } from "class-transformer";

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


}
