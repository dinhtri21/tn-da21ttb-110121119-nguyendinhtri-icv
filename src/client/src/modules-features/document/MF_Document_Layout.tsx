"use client";
import { useQuery } from "@tanstack/react-query";
import MF_Document from "./MF_Document";
import cvService from "@/api/services/cvService";
import { ICV } from "@/interface/cv";

interface IProp {
  id: string;
}
export default function MF_Document_Layout({ id }: IProp) {
  const query = useQuery<ICV>({
    queryKey: ["MF_Document_Layout",id],
    queryFn: async () => {
      const response = await cvService.getCVById(id);
      return response.data;
    },
  });

  if (query.isLoading) return "Loading...";
  if (query.isError) return "Không có dữ liệu...";

  console.log("query.data", query.data);

  return <MF_Document data={query.data!} />;
}
