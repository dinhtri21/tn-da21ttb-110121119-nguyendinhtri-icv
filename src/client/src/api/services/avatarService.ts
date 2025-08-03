import baseAxios from "@/api/config/baseAxios";
import { IAvatar, ICV } from "@/interface/cv";

const Controller = "avatar";

const avatarService = {
  // Create Avatar
  createAvatar: async (avatar: FormData) => {
    return await baseAxios.post<IAvatar>(`${Controller}`, avatar, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  },
};

export default avatarService;
