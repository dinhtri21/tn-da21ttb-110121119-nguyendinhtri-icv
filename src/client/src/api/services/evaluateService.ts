import baseAxios from "@/api/config/baseAxios";
import { IEvaluate } from "@/interface/evaluate";
import IMyResponse from "@/interface/response";

const Controller = "evaluate";
interface param {
  id: string;
}

const evaluateService = {
  // Get evaluations
  getEvaluations: async (params: param) => {
    return await baseAxios.get<IMyResponse<IEvaluate[]>>(`${Controller}`, { params });
  },
};

export default evaluateService;
