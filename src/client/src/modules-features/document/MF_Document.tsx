"use client";
import MyToolBar from "@/components/Toolbar/MyToolBar";
import {
  Button,
  Center,
  Container,
  Flex,
  Grid,
  ScrollArea,
  Text,
  Title,
} from "@mantine/core";
import CvContent from "./CVContent/CVContent";
import IConicTemplate from "./CVTemplate/IConic/IConicTemplate";

export default function MF_Document() {
  return (
    <Container size="80rem">
      <Flex flex={1} direction="column" gap={16}>
        <MyToolBar />
        <Grid>
          <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
            <CvContent />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
              <IConicTemplate />
          </Grid.Col>
        </Grid>
      </Flex>
    </Container>
  );
}

const cvData = {
  name: "Nguyen Van A",
  email: "nguyenvana@example.com",
  phone: "0123456789",
  address: "123 Đường ABC, Quận 1, TP.HCM",
  experience: [
    {
      company: "Công ty XYZ",
      position: "Nhân viên phát triển phần mềm",
      startDate: "01/2020",
      endDate: "12/2022",
      description:
        "Tham gia phát triển các dự án phần mềm lớn, sử dụng React và Node.js.",
    },
    {
      company: "Công ty ABC",
      position: "Thực tập sinh",
      startDate: "06/2019",
      endDate: "12/2019",
      description:
        "Hỗ trợ phát triển giao diện người dùng cho các ứng dụng web.",
    },
  ],
  education: [
    {
      school: "Đại học Công nghệ Thông tin",
      degree: "Cử nhân Khoa học Máy tính",
      startDate: "09/2015",
      endDate: "06/2019",
      description: "Tốt nghiệp loại giỏi, chuyên ngành Khoa học Máy tính.",
    },
  ],
  skills: ["JavaScript", "React", "Node.js", "HTML", "CSS", "Git"],
};
