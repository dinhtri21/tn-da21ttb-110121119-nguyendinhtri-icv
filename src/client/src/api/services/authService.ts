import { IUserLoginData } from "@/interface/user";
import { AxiosResponse } from "axios";
import baseAxios from "../config/baseAxios";
import { ICV } from "@/interface/cv";
import IMyResponse from "@/interface/response";

interface IBodyAuth {
  name?: string
  email: string;
  passWord: string;
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
