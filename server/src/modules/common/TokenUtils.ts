import { Injectable } from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import * as common from "./common"
import { v4 as uuidv4 } from 'uuid';
import { User, UserEssencialDTO } from "../user/user.entity";
@Injectable()
export class TokenUtils{

    generateAccessToken(user:User):string{
        try{
            const jti = uuidv4(); 
            const payload: common.TokenPayload = {
                Id: user.Id,
                name: user.name,
                last_name: user.last_name,
                };
            return jwt.sign({payload},common.privateKey,{
                expiresIn:60*5, //10 minutes,
                jwtid:jti

            })

        }catch(err){
            console.error("Error generating access token:", err.message || err);
            throw new Error("Token generation failed");
        }
    }

    generateRefreshToken(user:User):string{
        try{
            const jti = uuidv4(); 
            const payload: common.TokenPayload = {
                Id: user.Id,
                name: user.name,
                last_name: user.last_name,
                };
            return jwt.sign({payload},common.privateKey,{
                expiresIn:"7d",
                jwtid:jti
            })

        }catch(err){
            console.error("Error generating refresh token:", err.message || err);
            throw new Error("Token generation failed");
        }
    }
    async verifyToken(token: string): Promise<any> {
        try {
            return jwt.verify(token, common.privateKey);
        } catch (err) {
            console.error("Error verifying token:", err.message || err);
            throw err;
        }
    }
}
