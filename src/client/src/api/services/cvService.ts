import baseAxios from "@/api/config/baseAxios";
import { ICV } from "@/interface/cv";
import { IEvaluate } from "@/interface/evaluate";
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
  // Delete CV
  deleteCV: async (id: string) => {
    return await baseAxios.delete<IMyResponse<ICV>>(`${Controller}/${id}`);
  },
  // Import CV from PDF file
  importPDF: async (pdfFile: File) => {
    const formData = new FormData();
    formData.append("PdfFile", pdfFile);
    
    return await baseAxios.post<IMyResponse<ICV>>(`${Controller}/import-pdf`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  // Translate CV content to a target language
  translateCV: async (id: string, targetLanguage: string) => {
    return await baseAxios.post<IMyResponse<ICV>>(`${Controller}/${id}/translate?targetLanguage=${targetLanguage}`);
  },
  // Get public CV by ID (without authentication)
  getPublicCVById: async (id: string) => {
    return await baseAxios.get<IMyResponse<ICV>>(`${Controller}/${id}/public`);
  },
  // Get evaluations by CV ID
  getEvaluations: async (id: string) => {
    return await baseAxios.get<IMyResponse<IEvaluate[]>>(`${Controller}/${id}/evaluation`);
  },
  // Evaluate CV with job description
  evaluateWithJobDescription: async (id: string, jobDescription: string) => {
    return await baseAxios.post<IMyResponse<IEvaluate[]>>(`${Controller}/${id}/evaluation-with-jd?jobDescription=${jobDescription}`);
  },
};

export default cvService;
