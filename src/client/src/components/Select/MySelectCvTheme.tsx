"use client";
import {
  Button,
  Grid,
  Popover,
  TextInput,
  Image,
  Flex,
  Text,
} from "@mantine/core";
import { useState } from "react";
import { Carousel } from "@mantine/carousel";
import { IconChevronDown, IconBrandDatabricks } from "@tabler/icons-react";

export default function MySelectCvTheme() {
  const [opened, setOpened] = useState(false);
  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      width={300}
      trapFocus
      position="bottom"
      withArrow
      shadow="md"
    >
      <Popover.Target>
        <Button
          variant="default"
          leftSection={<IconBrandDatabricks stroke={1} size={16} />}
          rightSection={<IconChevronDown stroke={1} size={16} />}
          onClick={() => setOpened((o) => !o)}
        >
          Mẫu CV
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Carousel withIndicators controlsOffset={0} controlSize={20}>
          <Carousel.Slide>
            <Grid gutter={0}>
              <Grid.Col span={4}>
                <Flex direction="column" gap={4} align="center">
                  <Image
                    radius="md"
                    fit="cover"
                    h={99}
                    w={70}
                    src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-7.png"
                  />
                  <Text size="xs">IConic</Text>
                </Flex>
              </Grid.Col>
              <Grid.Col span={4}>
                <Flex direction="column" gap={4} align="center">
                  <Image
                    radius="md"
                    fit="cover"
                    h={99}
                    w={70}
                    src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-7.png"
                  />
                  <Text size="xs">Mẫu CV 1</Text>
                </Flex>
              </Grid.Col>
              <Grid.Col span={4}>
                <Flex direction="column" gap={4} align="center">
                  <Image
                    radius="md"
                    fit="cover"
                    h={99}
                    w={70}
                    src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-7.png"
                  />
                  <Text size="xs">Mẫu CV 1</Text>
                </Flex>
              </Grid.Col>
            </Grid>
          </Carousel.Slide>
          <Carousel.Slide>2</Carousel.Slide>
          <Carousel.Slide>3</Carousel.Slide>
        </Carousel>
      </Popover.Dropdown>
    </Popover>
  );
}
