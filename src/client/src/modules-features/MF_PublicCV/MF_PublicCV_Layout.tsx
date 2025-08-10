"use client";
import { useQuery } from "@tanstack/react-query";
import MF_PublicCV from "./MF_PublicCV";
import cvService from "@/api/services/cvService";
import { ICV } from "@/interface/cv";
import { Center, Text } from "@mantine/core";

interface IProp {
  id: string;
}

export default function MF_PublicCV_Layout({ id }: IProp) {
  const query = useQuery<ICV>({
    queryKey: ["MF_PublicCV_Layout", id],
    queryFn: async () => {
      try {
        const response = await cvService.getPublicCVById(id);
        return response.data.data || {};
      } catch (error) {
        console.error("Error fetching public CV:", error);
        return {} as ICV;
      }
    },
  });

  if (query.isLoading)
    return (
      <Center h={"100vh"} w="100%">
        Loading...
      </Center>
    );

  if (query.isError || !query.data)
    return (
      <Center h={"100vh"} w="100%">
        <Text size="xl" fw={600} c="red">
          CV này không tồn tại hoặc không được công khai
        </Text>
      </Center>
    );

  return <MF_PublicCV data={query.data} />;
}
