import { Flex, TextInput, Text, Textarea, Button, Group } from "@mantine/core";
import { IconPalette, IconBrain } from "@tabler/icons-react";

export default function OverviewSection() {
  return (
    <Flex flex={1} direction={"column"} gap={4} align="center" px={10}>
      <Textarea
        w="100%"
        label={
          <Text size="sm" fw={400}>
            Tổng quan
          </Text>
        }
        placeholder="Mục tiêu của tôi là trở thành một lập trình viên full-stack."
        autosize
        minRows={3}
        maxRows={4}
      />

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
