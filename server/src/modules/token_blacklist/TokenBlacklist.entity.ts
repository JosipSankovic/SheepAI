import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";


@Entity("token_blacklist")
export class TokenBlacklist{
    @PrimaryColumn()
    jti:string;

    @Column()
    userId:number;

    @Column({type:"datetime"})
    expiresAt:Date

    @Column({type:"boolean"})
    blacklisted:boolean;

    @CreateDateColumn()
    createdAt:Date;
}