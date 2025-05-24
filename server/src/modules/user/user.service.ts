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

    async getUserById(Id:number):Promise<User>{
        const user=await this.userRepository.findOne({where:{Id:Id}});
        if (!user )
            throw new NotFoundException('Worker not found');
        return user;
    }

     async loginUser(_user:UserLoginDTO):Promise<User>{
        try{
            let user_result = await this.userRepository.findOne({where:{email:_user.email}})
            if(!user_result)throw new NotFoundException()
            let isValid=await bcrypt.compare(_user.password,user_result.password)
            if(!isValid)throw new UnauthorizedException("Wrong password");
            return user_result;
        }catch(ex){
            console.error("Error in loginWorker:",ex.message||ex);
            throw ex
        }
    }

}
