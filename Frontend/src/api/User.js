import axios from "axios";
import { API_URL } from "./Common";

export const UserAPI = {
  login: (form_for_login) =>
    axios.post(`${API_URL}/user/login`, form_for_login, {
      withCredentials: true,
    }),
  tokenLogin: () =>
    axios.get(`${API_URL}/user/getUser`, {}, { withCredentials: true }),
  refreshAccessToken: () =>
    axios.post(`${API_URL}/user/refreshToken`, {}, { withCredentials: true }),
  logout:()=>
    axios.post(`${API_URL}/user/logout`,{},{withCredentials:true})
};
