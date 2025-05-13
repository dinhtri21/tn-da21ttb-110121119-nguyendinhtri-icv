import { Flex, Textarea, Text, Button, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconBrain, IconCalendarWeek, IconPlus } from "@tabler/icons-react";

export default function EducationSection() {
  return (
    <Flex flex={1} direction={"column"} gap={4} align="center" px={10}>
      <TextInput
        w="100%"
        label={
          <Text size="sm" fw={400}>
            Tên trường
          </Text>
        }
        placeholder="Đại học Trà Vinh"
      />
      <Flex w="100%" gap={8}>
        <TextInput
          w="50%"
          label={
            <Text size="sm" fw={400}>
              Chuyên ngành
            </Text>
          }
          placeholder="Công nghệ thông tin"
        />
        <TextInput
          w="50%"
          label={
            <Text size="sm" fw={400}>
              Xếp loại
            </Text>
          }
          placeholder="Giỏi"
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

      <Button
        size="sm"
        fw={400}
        mt={8}
        leftSection={<IconPlus stroke={1} size={16} />}
        variant="default"
      >
        Thêm học vấn
      </Button>
    </Flex>
  );
}
