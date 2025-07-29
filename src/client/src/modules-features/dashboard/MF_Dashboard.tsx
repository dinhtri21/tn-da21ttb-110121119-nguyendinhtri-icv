"use client";
import { ICV } from "@/interface/cv";
import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  Grid,
  Image,
  Menu,
  Stack,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import { IconDotsVertical, IconEye, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./css.module.css";

export default function MF_Dashboard() {
  const { colorScheme } = useMantineColorScheme();
  const router = useRouter();

  const query = useQuery<ICV[]>({
    queryKey: ["F_14w3vwnnfy_Read"],
    queryFn: async () => {
      return mockData;
    },
  });

  function handleCardClick(id: any) {
    router.push(`/document/${id}`);
  }

  if (query.isLoading) return "Loading...";
  if (query.isError) return "Không có dữ liệu...";

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
          <Text fw={400} size="md">
            Tạo sơ yếu lý lịch tùy chỉnh của riêng bạn với AI
          </Text>
        </Flex>
        <Button variant="light" color="red" leftSection={<IconTrash size={18} stroke={2} />}>
          Xoá tất cả
        </Button>
      </Flex>
      <Flex direction="column" mt={20}>
        <Text fw={500} size="md">
          Tất cả CV
        </Text>
        <Box>
          <Grid mt={16}>
            <Grid.Col span={{ base: 12, sm: 6, md: 3, lg: 2 }}>
              <Link href={`/document/1`}>
                <Center
                  h={220}
                  bg={colorScheme === "dark" ? "#1A1B1E" : "#F3F4F6"}
                  className={styles.cvNewCard}
                >
                  <Stack align="center" gap={4}>
                    <IconPlus size={32} stroke={1} />
                    <Text size="sm">Tạo mới</Text>
                  </Stack>
                </Center>
              </Link>
            </Grid.Col>
            {query?.data &&
              query.data.map((cv, i) => {
                return (
                  <Grid.Col key={i} span={{ base: 12, sm: 6, md: 3, lg: 2 }}>
                    {/* <Link href={`/document/${cv.document.id}`}> */}
                    <div
                      className={styles.cvCard}
                      style={{
                        borderRadius: 12,
                        overflow: "hidden",
                        cursor: "pointer",
                        height: 220,
                      }}
                      onClick={() => handleCardClick(cv.document.id)}
                    >
                      <Image
                        src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-7.png"
                        h={170}
                        fit="cover"
                      />
                      <Box px={12} py={4}>
                        <Text fw={500} size="sm" c="gray.8" lineClamp={1}>
                          {cv.document.title}
                        </Text>
                        <Flex justify="space-between" align="center">
                          <Text size="xs" c="dimmed" lineClamp={2}>
                            Cập nhật:{" "}
                            {new Date(cv.document.updatedAt ?? "").toLocaleDateString("vi-VN", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            })}
                          </Text>
                          <Box>
                            <div
                              onClick={(e) => {
                                e.stopPropagation(); // Ngăn click vào card
                              }}
                            >
                              <Menu shadow="md" width={90}>
                                <Menu.Target>
                                  <IconDotsVertical size={16} stroke={2} />
                                </Menu.Target>
                                <Menu.Dropdown>
                                  <Menu.Item
                                    onClick={() => handleCardClick(cv.document.id)}
                                    leftSection={<IconPencil size={14} color="blue" />}
                                  >
                                    Sửa
                                  </Menu.Item>
                                  <Menu.Item leftSection={<IconEye size={14} color="orange" />}>
                                    Xem
                                  </Menu.Item>
                                  <Menu.Item leftSection={<IconTrash size={14} color="red" />}>
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
          </Grid>
        </Box>
      </Flex>
    </Container>
  );
}

const mockData: ICV[] = [
  // {
  //   document: {
  //     id: "doc1",
  //     userId: "u1",
  //     title: "CV Nguyen Van A",
  //     summary:
  //       "Senior Frontend Developer with 5 years of experience in building scalable web applications using React and TypeScript.",
  //     themeColor: "#4A90E2",
  //     thumbnail: "https://example.com/thumbnail.jpg",
  //     currentPosition: 1,
  //     authorName: "Nguyen Van A",
  //     authorEmail: "vanA@gmail.com",
  //     createdAt: "2023-10-01T12:00:00Z",
  //     updatedAt: "2023-10-02T12:00:00Z",
  //   },
  //   pesonalInfo: {
  //     id: "pi1",
  //     documentId: "doc1",
  //     fullName: "Nguyen Van A",
  //     jobTitle: "Senior Frontend Developer",
  //     address: "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
  //     phone: "0123456789",
  //     email: "nguyenvana@example.com",
  //   },
  //   experiences: [
  //     {
  //       id: "exp1",
  //       documentId: "doc1",
  //       title: "Công ty ABC Technology",
  //       position: "Senior Frontend Developer",
  //       currentlyWorking: true,
  //       startDate: "2023-01-01",
  //       description: "Phát triển và tối ưu hóa các ứng dụng web quy mô lớn",
  //       endDate: undefined,
  //     },
  //   ],
  //   skills: [
  //     {
  //       id: "skill1",
  //       documentId: "doc1",
  //       name: "React",
  //       main: true,
  //     },
  //     {
  //       id: "skill2",
  //       documentId: "doc1",
  //       name: "TypeScript",
  //       main: true,
  //     },
  //     {
  //       id: "skill2",
  //       documentId: "doc1",
  //       name: "TypeScript2",
  //       main: false,
  //     },
  //   ],
  //   education: [
  //     {
  //       id: "edu1",
  //       documentId: "doc1",
  //       universityName: "Đại học Công nghệ",
  //       degree: "Cử nhân",
  //       major: "Công nghệ Thông tin",
  //       startDate: "2017-09-01",
  //       endDate: "2021-06-01",
  //     },
  //   ],
  // },
  // {
  //   document: {
  //     id: "doc1",
  //     userId: "u1",
  //     title: "CV Nguyen Van A",
  //     summary:
  //       "Senior Frontend Developer with 5 years of experience in building scalable web applications using React and TypeScript.",
  //     themeColor: "#4A90E2",
  //     thumbnail: "https://example.com/thumbnail.jpg",
  //     currentPosition: 1,
  //     authorName: "Nguyen Van A",
  //     authorEmail: "vanA@gmail.com",
  //     createdAt: "2023-10-01T12:00:00Z",
  //     updatedAt: "2023-10-02T12:00:00Z",
  //   },
  //   pesonalInfo: {
  //     id: "pi1",
  //     documentId: "doc1",
  //     firstName: "Nguyen Van",
  //     lastName: "A",
  //     jobTitle: "Senior Frontend Developer",
  //     address: "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
  //     phone: "0123456789",
  //     email: "nguyenvana@example.com",
  //   },
  //   experiences: [
  //     {
  //       id: "exp1",
  //       documentId: "doc1",
  //       title: "Công ty ABC Technology",
  //       position: "Senior Frontend Developer",
  //       currentlyWorking: true,
  //       startDate: "2023-01-01",
  //       description: "Phát triển và tối ưu hóa các ứng dụng web quy mô lớn",
  //       endDate: undefined,
  //     },
  //   ],
  //   skills: [
  //     {
  //       id: "skill1",
  //       documentId: "doc1",
  //       name: "React",
  //       main: true,
  //     },
  //     {
  //       id: "skill2",
  //       documentId: "doc1",
  //       name: "TypeScript",
  //       main: true,
  //     },
  //     {
  //       id: "skill2",
  //       documentId: "doc1",
  //       name: "TypeScript2",
  //       main: false,
  //     },
  //   ],
  //   education: [
  //     {
  //       id: "edu1",
  //       documentId: "doc1",
  //       universityName: "Đại học Công nghệ",
  //       degree: "Cử nhân",
  //       major: "Công nghệ Thông tin",
  //       startDate: "2017-09-01",
  //       endDate: "2021-06-01",
  //     },
  //   ],
  // },
  // {
  //   document: {
  //     id: "doc1",
  //     userId: "u1",
  //     title: "CV Nguyen Van A",
  //     summary:
  //       "Senior Frontend Developer with 5 years of experience in building scalable web applications using React and TypeScript.",
  //     themeColor: "#4A90E2",
  //     thumbnail: "https://example.com/thumbnail.jpg",
  //     currentPosition: 1,
  //     authorName: "Nguyen Van A",
  //     authorEmail: "vanA@gmail.com",
  //     createdAt: "2023-10-01T12:00:00Z",
  //     updatedAt: "2023-10-02T12:00:00Z",
  //   },
  //   pesonalInfo: {
  //     id: "pi1",
  //     documentId: "doc1",
  //     firstName: "Nguyen Van",
  //     lastName: "A",
  //     jobTitle: "Senior Frontend Developer",
  //     address: "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
  //     phone: "0123456789",
  //     email: "nguyenvana@example.com",
  //   },
  //   experiences: [
  //     {
  //       id: "exp1",
  //       documentId: "doc1",
  //       title: "Công ty ABC Technology",
  //       position: "Senior Frontend Developer",
  //       currentlyWorking: true,
  //       startDate: "2023-01-01",
  //       description: "Phát triển và tối ưu hóa các ứng dụng web quy mô lớn",
  //       endDate: undefined,
  //     },
  //   ],
  //   skills: [
  //     {
  //       id: "skill1",
  //       documentId: "doc1",
  //       name: "React",
  //       main: true,
  //     },
  //     {
  //       id: "skill2",
  //       documentId: "doc1",
  //       name: "TypeScript",
  //       main: true,
  //     },
  //     {
  //       id: "skill2",
  //       documentId: "doc1",
  //       name: "TypeScript2",
  //       main: false,
  //     },
  //   ],
  //   education: [
  //     {
  //       id: "edu1",
  //       documentId: "doc1",
  //       universityName: "Đại học Công nghệ",
  //       degree: "Cử nhân",
  //       major: "Công nghệ Thông tin",
  //       startDate: "2017-09-01",
  //       endDate: "2021-06-01",
  //     },
  //   ],
  // },
  // {
  //   document: {
  //     id: "doc1",
  //     userId: "u1",
  //     title: "CV Nguyen Van A",
  //     summary:
  //       "Senior Frontend Developer with 5 years of experience in building scalable web applications using React and TypeScript.",
  //     themeColor: "#4A90E2",
  //     thumbnail: "https://example.com/thumbnail.jpg",
  //     currentPosition: 1,
  //     authorName: "Nguyen Van A",
  //     authorEmail: "vanA@gmail.com",
  //     createdAt: "2023-10-01T12:00:00Z",
  //     updatedAt: "2023-10-02T12:00:00Z",
  //   },
  //   pesonalInfo: {
  //     id: "pi1",
  //     documentId: "doc1",
  //     firstName: "Nguyen Van",
  //     lastName: "A",
  //     jobTitle: "Senior Frontend Developer",
  //     address: "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
  //     phone: "0123456789",
  //     email: "nguyenvana@example.com",
  //   },
  //   experiences: [
  //     {
  //       id: "exp1",
  //       documentId: "doc1",
  //       title: "Công ty ABC Technology",
  //       position: "Senior Frontend Developer",
  //       currentlyWorking: true,
  //       startDate: "2023-01-01",
  //       description: "Phát triển và tối ưu hóa các ứng dụng web quy mô lớn",
  //       endDate: undefined,
  //     },
  //   ],
  //   skills: [
  //     {
  //       id: "skill1",
  //       documentId: "doc1",
  //       name: "React",
  //       main: true,
  //     },
  //     {
  //       id: "skill2",
  //       documentId: "doc1",
  //       name: "TypeScript",
  //       main: true,
  //     },
  //     {
  //       id: "skill2",
  //       documentId: "doc1",
  //       name: "TypeScript2",
  //       main: false,
  //     },
  //   ],
  //   education: [
  //     {
  //       id: "edu1",
  //       documentId: "doc1",
  //       universityName: "Đại học Công nghệ",
  //       degree: "Cử nhân",
  //       major: "Công nghệ Thông tin",
  //       startDate: "2017-09-01",
  //       endDate: "2021-06-01",
  //     },
  //   ],
  // },
  // {
  //   document: {
  //     id: "doc1",
  //     userId: "u1",
  //     title: "CV Nguyen Van A",
  //     summary:
  //       "Senior Frontend Developer with 5 years of experience in building scalable web applications using React and TypeScript.",
  //     themeColor: "#4A90E2",
  //     thumbnail: "https://example.com/thumbnail.jpg",
  //     currentPosition: 1,
  //     authorName: "Nguyen Van A",
  //     authorEmail: "vanA@gmail.com",
  //     createdAt: "2023-10-01T12:00:00Z",
  //     updatedAt: "2023-10-02T12:00:00Z",
  //   },
  //   pesonalInfo: {
  //     id: "pi1",
  //     documentId: "doc1",
  //     firstName: "Nguyen Van",
  //     lastName: "A",
  //     jobTitle: "Senior Frontend Developer",
  //     address: "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
  //     phone: "0123456789",
  //     email: "nguyenvana@example.com",
  //   },
  //   experiences: [
  //     {
  //       id: "exp1",
  //       documentId: "doc1",
  //       title: "Công ty ABC Technology",
  //       position: "Senior Frontend Developer",
  //       currentlyWorking: true,
  //       startDate: "2023-01-01",
  //       description: "Phát triển và tối ưu hóa các ứng dụng web quy mô lớn",
  //       endDate: undefined,
  //     },
  //   ],
  //   skills: [
  //     {
  //       id: "skill1",
  //       documentId: "doc1",
  //       name: "React",
  //       main: true,
  //     },
  //     {
  //       id: "skill2",
  //       documentId: "doc1",
  //       name: "TypeScript",
  //       main: true,
  //     },
  //     {
  //       id: "skill2",
  //       documentId: "doc1",
  //       name: "TypeScript2",
  //       main: false,
  //     },
  //   ],
  //   education: [
  //     {
  //       id: "edu1",
  //       documentId: "doc1",
  //       universityName: "Đại học Công nghệ",
  //       degree: "Cử nhân",
  //       major: "Công nghệ Thông tin",
  //       startDate: "2017-09-01",
  //       endDate: "2021-06-01",
  //     },
  //   ],
  // },
];
