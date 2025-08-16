import IMyResponse from "@/interface/response";
import { IUserLoginData } from "@/interface/user";
import baseAxios from "../config/baseAxios";

interface IBodyAuth {
  name?: string
  email?: string;
  password?: string;
}

const Controller = "auth";

export const authService = {
  // GG login
  getGoogleLoginUrl: async () => {
    return baseAxios.get<{ redirectUrl: string }>(`${Controller}/google-login`);
  },
  // Local login
  login: async (data: IBodyAuth) => {
    return baseAxios.post<IMyResponse<IUserLoginData>>(`${Controller}/sign-in`, data);
  },
  // Sign up
  signUp: async (data: IBodyAuth) => {
    return baseAxios.post<IMyResponse<{id: string}>>(`${Controller}/sign-up`, data);
  }
};
