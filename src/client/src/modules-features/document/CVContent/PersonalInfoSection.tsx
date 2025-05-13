import { Flex, Group, TextInput, Text } from "@mantine/core";

export default function PersonalInfoSection() {
  return (
    <Flex direction={"column"} gap={4} align="center" px={10}>
      <TextInput
        w="100%"
        label={
          <Text size="sm" fw={400}>
            Họ và tên
          </Text>
        }
        placeholder="Nguyễn Văn A"
      />
      <TextInput
        w="100%"
        label={
          <Text size="sm" fw={400}>
            Chức vụ
          </Text>
        }
        placeholder="Sinh viên"
      />
      <Flex w="100%" gap={8}>
        <TextInput
          w="50%"
          label={
            <Text size="sm" fw={400}>
              Email
            </Text>
          }
          placeholder="a@gmail.com"
        />
        <TextInput
          w="50%"
          label={
            <Text size="sm" fw={400}>
              Số điện thoại
            </Text>
          }
          placeholder="0123456789"
        />
      </Flex>
      <TextInput
        w="100%"
        label={
          <Text size="sm" fw={400}>
            Địa chỉ
          </Text>
        }
        placeholder="Hà Nội, Việt Nam"
      />
    </Flex>
  );
}
