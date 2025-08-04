import baseAxios from "@/api/config/baseAxios";
import { ICV } from "@/interface/cv";
import IMyResponse from "@/interface/response";

const Controller = "CV";

const cvService = {
  // Create a new CV
  createCV: async (cv: ICV) => {
    return await baseAxios.post<IMyResponse<ICV>>(`${Controller}`, cv);
  },
  // Get CVs
  getCVs: async () => {
    return await baseAxios.get<IMyResponse<ICV[]>>(`${Controller}`);
  },
  // Get CV by ID
  getCVById: async (id: string) => {
    return await baseAxios.get<IMyResponse<ICV>>(`${Controller}/${id}`);
  },
  // Update CV
  updateCV: async (id: string, cv: ICV) => {
    return await baseAxios.put<IMyResponse<ICV>>(`${Controller}/${id}`, cv);
  },  
};

export default cvService;
