import axios from "axios"
import { API_URL } from "./Common"

export const ChatAPI={
    sendMessage:(messages)=>{
        return axios.post(`${API_URL}/chat`,{messages},{withCredentials:true})
    }
}