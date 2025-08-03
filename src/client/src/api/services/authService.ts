import { IUserLoginData } from "@/interface/user";
import { AxiosResponse } from "axios";
import baseAxios from "../config/baseAxios";

const Controller = "auth";

export const authService = {
  // GG login
  getGoogleLoginUrl: async () => {
    return baseAxios.get<{ redirectUrl: string }>(`${Controller}/google-login`);
  },
};
