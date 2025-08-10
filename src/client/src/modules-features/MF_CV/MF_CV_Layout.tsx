"use client";
import { useQuery } from "@tanstack/react-query";
import MF_Document from "./MF_CV";
import cvService from "@/api/services/cvService";
import { ICV } from "@/interface/cv";
import { useDisclosure } from "@mantine/hooks";
import { Center } from "@mantine/core";

interface IProp {
  id: string;
}
export default function MF_CV_Layout({ id }: IProp) {
  const query = useQuery<ICV>({
    queryKey: ["MF_CV_Layout", id],
    queryFn: async () => {
      const response = await cvService.getCVById(id);
      return response.data.data || {};
    },
  });

  if (query.isLoading)
    return (
      <Center h={"100vh"} w="100%">
        Loading...
      </Center>
    );
  if (query.isError) return "Không có dữ liệu...";

  return <MF_Document data={query.data!} />;
}
