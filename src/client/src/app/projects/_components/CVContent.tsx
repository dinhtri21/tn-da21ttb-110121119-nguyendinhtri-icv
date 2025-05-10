import { Accordion, Flex, Text } from "@mantine/core";
import React from "react";
import PersonalInfoSection from "./PersonalInfoSection";
import OverviewSection from "./OverviewSection";
import WorkExperienceSection from "./WorkExperienceSection";

interface accordionItem {
  value: string;
  label: string;
  content: React.ReactNode;
}

const accordionItems: accordionItem[] = [
  {
    value: "item-1",
    label: "Thông tin cá nhân",
    content: <PersonalInfoSection />,
  },
  {
    value: "item-2",
    label: "Tổng quan",
    content: <OverviewSection />,
  },
  {
    value: "item-3",
    label: "Kinh nghiệm chuyên môn",
    content: <WorkExperienceSection />,
  },
  {
    value: "item-4",
    label: "Giáo dục",
    content: "Nội dung của item 3",
  },
  {
    value: "item-5",
    label: "Kỹ năng",
    content: "Nội dung của item 3",
  },
  {
    value: "item-6",
    label: "Dự án cá nhân",
    content: "Nội dung của item 3",
  },
];

export default function CVContent() {
  return (
    <Flex flex={1} direction="column" gap={4} align="center">
      <Accordion w="100%" >
        {accordionItems.map((item) => (
          <Accordion.Item key={item.value} value={item.value}>
            <Accordion.Control>
              <Text fw={500}>{item.label}</Text>
            </Accordion.Control>
            <Accordion.Panel>{item.content}</Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Flex>
  );
}
