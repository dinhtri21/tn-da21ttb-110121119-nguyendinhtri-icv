import MyRichTextEditor from "@/components/RichTextEditor/MyRichTextEditor";
import { Flex, Textarea, Text, Button, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconBrain, IconCalendarWeek } from "@tabler/icons-react";

export default function ProjectSection() {
  return (
    <Flex flex={1} direction={"column"} gap={4} align="center" px={10}>
      <TextInput
        w="100%"
        label={
          <Text size="sm" fw={400}>
            Tên dự án
          </Text>
        }
        placeholder="iCV"
      />
      <Textarea
        w="100%"
        label={
          <Text size="sm" fw={400}>
            Mô tả
          </Text>
        }
        placeholder="E-commerce web application"
        autosize
        minRows={3}
        maxRows={4}
      />
      <Flex w="100%" gap={8}>
        <DateInput
          w="50%"
          label={
            <Text size="sm" fw={400}>
              Ngày bắt đầu
            </Text>
          }
          rightSection={<IconCalendarWeek stroke={1} size={16} />}
          placeholder="DD/MM/YYYY"
          valueFormat="DD/MM/YYYY"
        />
        <DateInput
          w="50%"
          label={
            <Text size="sm" fw={400}>
              Ngày kết thúc
            </Text>
          }
          rightSection={<IconCalendarWeek stroke={1} size={16} />}
          placeholder="DD/MM/YYYY"
          valueFormat="DD/MM/YYYY"
        />
      </Flex>
      <TextInput
        w="100%"
        label={
          <Text size="sm" fw={400}>
            Vị trí
          </Text>
        }
        placeholder="Lập trình viên"
      />

      <MyRichTextEditor label="Công nghệ sử dụng" />

      <Button
        leftSection={<IconBrain stroke={1} size={16} />}
        variant="default"
        mt={8}
        size="sm"
        fw={400}
      >
        Tạo bằng AI
      </Button>
    </Flex>
  );
}
