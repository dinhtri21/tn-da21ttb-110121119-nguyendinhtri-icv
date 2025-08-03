import baseAxios from "@/api/config/baseAxios";
import { IEvaluate, IEvaluates } from "@/interface/evaluate";

const Controller = "evaluate";
interface param {
  id: string;
}

const evaluateService = {
  // Get evaluations
  getEvaluations: async (params: param) => {
    return await baseAxios.get<IEvaluates>(`${Controller}`, { params });
  },
};

export default evaluateService;
