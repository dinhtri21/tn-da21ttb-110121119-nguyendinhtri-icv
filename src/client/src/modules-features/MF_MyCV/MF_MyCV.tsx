"use client";
import cvService from "@/api/services/cvService";
import { ICV } from "@/interface/cv";
import {
  ActionIcon,
  Box,
  Button,
  Center,
  Container,
  Flex,
  Grid,
  Menu,
  Stack,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconDotsVertical,
  IconEye,
  IconFileCv,
  IconPencil,
  IconPlus,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import styles from "./css.module.css";
import { SkeletonCard } from "./SkeletonCard";
import { utils_date_DateToDDMMYYYYHHMMString } from "@/utils/date";
import { useRef } from "react";

export default function MF_MyCV() {
  const { colorScheme } = useMantineColorScheme();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const query = useQuery<ICV[]>({
    queryKey: ["MF_Dashboard"],
    queryFn: async () => {
      const response = await cvService.getCVs();
      return response.data.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (cv: ICV) => {
      return await cvService.createCV(cv);
    },
    onSuccess: () => {
      notifications.show({
        title: "Thành công",
        message: "Đã tạo CV mới thành công!",
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Lỗi",
        message: "Không thể tạo CV mới. Vui lòng thử lại sau.",
        color: "red",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await cvService.deleteCV(id);
    },
    onSuccess: () => {
      query.refetch();
      notifications.show({
        title: "Thành công",
        message: "Đã xóa CV thành công!",
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Lỗi",
        message: "Không thể xóa CV. Vui lòng thử lại sau.",
        color: "red",
      });
    },
  });

  const importPdfMutation = useMutation({
    mutationFn: async (file: File) => {
      return await cvService.importPDF(file);
    },
    onSuccess: (data) => {
      query.refetch();
      notifications.show({
        title: "Thành công",
        message: "Đã import CV từ PDF thành công!",
        color: "green",
      });
      if (data?.data?.data?.id) {
        router.push(`/cv/${data.data.data.id}`);
      }
    },
    onError: (error: any) => {
      notifications.show({
        title: "Lỗi",
        message: "Không thể import CV từ PDF. Vui lòng thử lại sau.",
        color: "red",
      });
    },
  });

  const handleCardClick = (id: any) => {
    router.push(`/cv/${id}`);
  };

  const handleCreateNew = async () => {
    await createMutation.mutate({ fileName: "Chưa đặt tên", createWhen: new Date() });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa CV này?")) {
      await deleteMutation.mutate(id);
    }
  };

  const handleImportPdf = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        importPdfMutation.mutate(file);
      } else {
        notifications.show({
          title: "Lỗi",
          message: "Vui lòng chọn file PDF!",
          color: "red",
        });
      }
    }
    // Reset input để có thể chọn lại cùng một file
    if (event.target) {
      event.target.value = "";
    }
  };

  if (query.isLoading) return "Loading...";
  if (query.isError) return "Không có dữ liệu...";

  if (createMutation.isSuccess) {
    window.location.href = `/document/${createMutation.data?.data?.data?.id}`;
  }

  return (
    <Container px={16} size="80rem" pb={16} mt={16}>
      <Flex justify={"space-between"} align="center" gap={8} wrap="wrap">
        <Flex
          direction="column"
          //   gap={8}
        >
          <Text fw={500} size="xl">
            Quản lý CV
          </Text>
          <Text fw={400} size="sm">
            Tạo sơ yếu lý lịch tùy chỉnh của riêng bạn với AI
          </Text>
        </Flex>
        <Button
          variant="light"
          color="blue"
          leftSection={<IconUpload size={18} stroke={2} />}
          onClick={handleImportPdf}
          loading={importPdfMutation.isPending}
          size="sm"
        >
          Import PDF
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf"
          style={{ display: "none" }}
        />
      </Flex>
      <Flex direction="column" mt={20}>
        <Text fw={500} size="md">
          Tất cả CV
        </Text>
        <Box>
          <Grid mt={16}>
            <Grid.Col span={{ base: 12, sm: 6, md: 3, lg: 2 }}>
              <Center
                style={{ cursor: "pointer" }}
                h={220}
                bg={colorScheme === "dark" ? "gray.8" : "#F3F4F6"}
                className={styles.cvNewCard}
                onClick={handleCreateNew}
              >
                <Stack align="center" gap={4}>
                  <IconPlus size={32} stroke={1} style={{ color: "#228BE6" }} />
                  <Text c="blue" size="sm">
                    Tạo mới
                  </Text>
                </Stack>
              </Center>
            </Grid.Col>
            {query?.data &&
              query.data.map((cv, i) => {
                return (
                  <Grid.Col key={i} span={{ base: 12, sm: 6, md: 3, lg: 2 }}>
                    <div
                      className={styles.cvCard}
                      style={{
                        borderRadius: 12,
                        overflow: "hidden",
                        cursor: "pointer",
                        height: 220,
                      }}
                      onClick={() => handleCardClick(cv.id)}
                    >
                      <Center h={170} bg={colorScheme === "dark" ? "gray.8" : "#F3F4F6"}>
                        <IconFileCv size={60} stroke={0.3} color="gray" />
                        {/* <Text c="gray" fw={200} fz={20}>CV</Text> */}
                      </Center>
                      <Box px={12} py={4} className="border-t border-gray-200">
                        <Text
                          fw={500}
                          size="sm"
                          c={colorScheme === "dark" ? "gray.4" : "gray.8"}
                          lineClamp={1}
                        >
                          {cv.fileName}
                        </Text>
                        <Flex justify="space-between" align="center">
                          <Text
                            size="xs"
                            c={colorScheme === "dark" ? "gray.4" : "gray.8"}
                            lineClamp={2}
                          >
                            {utils_date_DateToDDMMYYYYHHMMString(cv.createWhen!)}
                          </Text>
                          <Box>
                            <div
                              onClick={(e) => {
                                e.stopPropagation(); // Ngăn click vào card
                              }}
                            >
                              <Menu shadow="md" width={90}>
                                <Menu.Target>
                                  <IconDotsVertical
                                    size={16}
                                    stroke={2}
                                    style={{ color: "#228BE6" }}
                                  />
                                </Menu.Target>
                                <Menu.Dropdown>
                                  <Menu.Item
                                    leftSection={
                                      <ActionIcon
                                        size="sm"
                                        variant="light"
                                        color="red"
                                        onClick={() => cv.id && handleDelete(cv.id)}
                                      >
                                        <IconTrash stroke={1.5} />
                                      </ActionIcon>
                                    }
                                  >
                                    Xoá
                                  </Menu.Item>
                                </Menu.Dropdown>
                              </Menu>
                            </div>
                          </Box>
                        </Flex>
                      </Box>
                    </div>
                    {/* </Link> */}
                  </Grid.Col>
                );
              })}

            {query?.data &&
              Array.from({ length: Math.max(0, 11 - query.data.length) }).map((_, i) => (
                <Grid.Col key={`skeleton-${i}`} span={{ base: 12, sm: 6, md: 3, lg: 2 }}>
                  <SkeletonCard isAnimation={false} />
                </Grid.Col>
              ))}
          </Grid>
        </Box>
      </Flex>
    </Container>
  );
}
