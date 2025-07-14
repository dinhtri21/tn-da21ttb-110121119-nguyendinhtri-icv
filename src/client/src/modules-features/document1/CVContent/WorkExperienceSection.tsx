import { Flex, TextInput, Text, Textarea, Button } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconBrain, IconCalendarWeek, IconPlus } from "@tabler/icons-react";

export default function WorkExperienceSection() {
  return (
    <Flex flex={1} direction={"column"} gap={4} align="center" px={10}>
      <Flex w="100%" gap={8}>
        <TextInput
          w="50%"
          label={
            <Text size="sm" fw={400}>
              Vị trí
            </Text>
          }
          placeholder="Lập trình viên"
        />
        <TextInput
          w="50%"
          label={
            <Text size="sm" fw={400}>
              Công ty
            </Text>
          }
          placeholder="Công ty ABC"
        />
      </Flex>
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
      <Textarea
        w="100%"
        label={
          <Text size="sm" fw={400}>
            Tóm tắt công việc
          </Text>
        }
        placeholder="Lorem Ipsum is simply dummy text of the printing and typesetting industry. "
        autosize
        minRows={3}
        maxRows={4}
      />

      <Button
        mt={8}
        size="sm"
        fw={400}
        leftSection={<IconBrain stroke={1} size={16} />}
        variant="default"
      >
        Tạo bằng AI
      </Button>
      <Button
        mt={8}
        size="sm"
        fw={400}
        leftSection={<IconPlus stroke={1} size={16} />}
        variant="default"
      >
        Thêm kinh nghiệm chuyên môn
      </Button>
    </Flex>
  );
}
