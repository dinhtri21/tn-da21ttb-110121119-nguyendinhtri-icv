"use client";

import {
  ActionIcon,
  Anchor,
  Button,
  Center,
  Checkbox,
  Divider,
  Flex,
  Group,
  Paper,
  PaperProps,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { upperFirst, useToggle } from "@mantine/hooks";
import { useMantineColorScheme, useComputedColorScheme } from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";

export default function AuthenticationForm(props: PaperProps) {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  const [type, toggle] = useToggle(["Đăng nhập", "Đăng ký"]);
  const form = useForm({
    initialValues: {
      email: "",
      name: "",
      password: "",
      terms: true,
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
      password: (val) =>
        val.length <= 6
          ? "Password should include at least 6 characters"
          : null,
    },
  });

  return (
    <Center h="100vh" w="100vw">
      <Paper radius="md" p="xl" withBorder {...props} miw={360}>
        <Flex direction={"row"} justify={"space-between"} mb="xl">
          <Text size="lg" fw={500}>
            Chào mừng đến với iCV
          </Text>
          <ActionIcon
            onClick={() =>
              setColorScheme(computedColorScheme === "light" ? "dark" : "light")
            }
            variant="default"
            size="lg"
            aria-label="Toggle color scheme"
          >
            {computedColorScheme === "light" ? (
              <IconSun stroke={1.5} />
            ) : (
              <IconMoon stroke={1.5} />
            )}
          </ActionIcon>
        </Flex>
        <Text size="sm" fw={400} c="gray">
          {type} với
        </Text>

        <Group grow mb="md" mt="md">
          <Button variant="default" w="100%" radius="xl">
            <img
              src="/icons/google.svg"
              alt="My Icon"
              width={16}
              height={16}
            />
          </Button>
          <Button variant="default" w="100%" radius="xl">
            <img
              src="/icons/facebook.svg"
              alt="My Icon"
              width={16}
              height={16}
            />
          </Button>
        </Group>

        <Divider
          label={
            <Text size="sm" c="gray">
              Hoặc đăng nhập bằng email
            </Text>
          }
          labelPosition="center"
          my="lg"
        />

        <form onSubmit={form.onSubmit(() => {})}>
          <Stack>
            {type === "register" && (
              <TextInput
                label="Name"
                placeholder="Your name"
                value={form.values.name}
                onChange={(event) =>
                  form.setFieldValue("name", event.currentTarget.value)
                }
                radius="md"
              />
            )}

            <TextInput
              required
              label="Email"
              placeholder="hello@mantine.dev"
              value={form.values.email}
              onChange={(event) =>
                form.setFieldValue("email", event.currentTarget.value)
              }
              error={form.errors.email && "Invalid email"}
              radius="md"
            />

            <PasswordInput
              required
              label="Mật khẩu"
              placeholder="abc123"
              value={form.values.password}
              onChange={(event) =>
                form.setFieldValue("password", event.currentTarget.value)
              }
              error={
                form.errors.password &&
                "Password should include at least 6 characters"
              }
              radius="md"
            />

            {type === "register" && (
              <Checkbox
                label="I accept terms and conditions"
                checked={form.values.terms}
                onChange={(event) =>
                  form.setFieldValue("terms", event.currentTarget.checked)
                }
              />
            )}
          </Stack>

          <Group justify="space-between" mt="xl">
            <Anchor
              component="button"
              type="button"
              c="dimmed"
              onClick={() => toggle()}
              size="xs"
            >
              {type === "Đăng ký"
                ? "Bạn đã có tài khoản? Đăng nhập"
                : "Bạn chưa có tài khoản? Đăng ký"}
            </Anchor>
            <Button type="submit" radius="xl">
              {upperFirst(type)}
            </Button>
          </Group>
        </form>
      </Paper>
    </Center>
  );
}
