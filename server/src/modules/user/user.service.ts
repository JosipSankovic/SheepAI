import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt"


@Injectable()
export class UserService{
    constructor(
        @InjectRepository(User)
        private userRepository:Repository<User>
    ){}

    async getUser(userId:number):Promise<User>{
        let user=await this.userRepository.findOne({where:{Id:userId}})
        if (!user) throw new NotFoundException()
        return user;
    }

}
