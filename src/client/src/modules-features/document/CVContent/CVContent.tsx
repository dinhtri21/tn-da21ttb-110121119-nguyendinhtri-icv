import { Accordion, Flex, Text } from "@mantine/core";
import React from "react";
import PersonalInfoSection from "./PersonalInfoSection";
import OverviewSection from "./OverviewSection";
import WorkExperienceSection from "./WorkExperienceSection";
import EducationSection from "./EducationSection";
import SkillsSection from "./SkillsSection";
import ProjectSection from "./ProjectSection";

interface accordionItem {
  value: string;
  label: string;
  content: React.ReactNode;
}

const accordionItems: accordionItem[] = [
  {
    value: "item1",
    label: "Thông tin cá nhân",
    content: <PersonalInfoSection />,
  },
  {
    value: "item2",
    label: "Tổng quan",
    content: <OverviewSection />,
  },

  {
    value: "item4",
    label: "Học vấn",
    content: <EducationSection />,
  },
  {
    value: "item5",
    label: "Kỹ năng",
    content: <SkillsSection />,
  },
  {
    value: "item3",
    label: "Kinh nghiệm chuyên môn",
    content: <WorkExperienceSection />,
  },
  {
    value: "item6",
    label: "Dự án cá nhân",
    content: <ProjectSection />,
  },
];

export default function CVContent() {
  return (
    <Flex flex={1} miw="320px" direction="column" gap={4} >
      <Accordion  >
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
