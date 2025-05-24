import { HttpStatus } from "@nestjs/common";


export async function HandleError<T,E=Error>(promise:Promise<T>):Promise<[undefined,T]|[E,undefined]> {
    try{
        const result=await promise;
        return [undefined,result]
    }catch(error){
        return [error as E,undefined]
    }
}


export async function HandleCustomError<T,E extends new(message?:string)=>Error>(promise:Promise<T>,errorsToCatch?:E[]):Promise<[undefined,T]|[InstanceType<E>]>{
    try{
        const result=await promise
        return [undefined,result] as [undefined,T]
    }catch(error){
        if (errorsToCatch==undefined)
            return [error]
        if(errorsToCatch.some(e=>error instanceof e))
            return [error]
        throw error
    }
}


export class NoResourceError extends Error{
    name="NoResourceError";
    status=HttpStatus.NOT_FOUND
}