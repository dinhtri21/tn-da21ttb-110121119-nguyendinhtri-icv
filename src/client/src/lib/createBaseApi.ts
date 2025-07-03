import { AxiosInstance } from "axios";

export default function createBaseApi<T>(controller: string, httpClient: AxiosInstance) {
  return {
    // getById: (id: number) => httpClient.get<T>(`${controller}/${id}`),
    getAll: () => httpClient.get<T[]>(`${controller}`),
    create: (data: T) => httpClient.post(`${controller}`, data),
    update: (id: number, data: T) => httpClient.put(`${controller}/${id}`, data),
    delete: (id: number) => httpClient.delete(`${controller}/${id}`),
  };
}
