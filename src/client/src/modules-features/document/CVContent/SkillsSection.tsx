import { Flex, Textarea, Text, Button, TextInput } from "@mantine/core";
import { IconBrain, IconPlus } from "@tabler/icons-react";

export default function SkillsSection() {
  return (
    <Flex flex={1} direction={"column"} gap={4} align="center" px={10}>
      {/* Main skills */}
      <TextInput
        w="100%"
        label={
          <Text size="sm" fw={400}>
            Kỹ năng chính
          </Text>
        }
        placeholder="HTML, CSS, JavaScript (ReactJS, React-Native, Lit)"
      />
      <TextInput w="100%" placeholder="Node (ExpressJS)" />
      <TextInput
        w="100%"
        placeholder="Server (Apache, Nginx, Redis, Memcached, Queue, Log, Crontjob...), Rancher, K8S, Docker"
      />
      <Button
        size="sm"
        fw={400}
        leftSection={<IconPlus stroke={1} size={16} />}
        variant="default"
      >
        Thêm kỹ năng
      </Button>
      {/* Other skills*/}
      <TextInput
        w="100%"
        label={
          <Text size="sm" fw={400}>
            Kỹ năng khác
          </Text>
        }
        placeholder=" GIT, Postman"
      />
      <TextInput w="100%" placeholder="Figma" />
      <Button
        size="sm"
        fw={400}
        leftSection={<IconPlus stroke={1} size={16} />}
        variant="default"
      >
        Thêm kỹ năng
      </Button>
    </Flex>
  );
}
