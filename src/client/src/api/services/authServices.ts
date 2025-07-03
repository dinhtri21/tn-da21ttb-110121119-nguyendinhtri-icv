import { IUserLoginData } from "@/interface/user";
import { AxiosResponse } from "axios";
import baseAxios from "../config/baseAxios";

export const authServices = {
  // GG login
  getGoogleLoginUrl: async () => {
    return baseAxios.get<{ redirectUrl: string }>("/auth/google-login");
  },
 
};
