import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User, UserEssencialDTO, UserLoginDTO } from "./user.entity";
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

     async loginUser(_user:UserLoginDTO):Promise<User>{
        try{
            let user_result = await this.userRepository.findOne({where:{email:_user.email}})
            if(!user_result)throw new NotFoundException()
            let isValid=await bcrypt.compare(user_result.password,_user.password)
            if(!isValid)throw new UnauthorizedException("Wrong password");
            return user_result;
        }catch(ex){
            console.error("Error in loginWorker:",ex.message||ex);
            throw ex
        }
    }

}
