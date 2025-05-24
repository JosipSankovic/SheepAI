import { UserAPI } from "./User";

export const API_URL = "http://localhost:5001/api";
export function sqlBoolean(value) {
  switch (value) {
    case true:
      return 1;
    case false:
      return 0;
  }
}
export const tokenloginAndFetchUser = async (token) => {
  try {
    if (!token) return;
    const res_login = await UserAPI.tokenLogin();
    const { token_returned, user } = res_login.data;
    if (!user) {
      console.error("No user data found");
      return [null,null];
    }
    return [token,user];
  } catch (err) {
    throw new Error("Token login failed");
  }
};

export const fetchBusiness = async (id) => {
  try {
    const res_business = await BusinessAPI.getBusiness(id);
    const business = res_business.data;
    if (!business || !business.Id) {
      console.error("Invalid business data received");
      throw new Error("Cant fetch business");
    }
    return business;
  } catch (err) {
    console.error("Error fetching business data:", err);
    throw new Error("Cant fetch business");
  }
};
