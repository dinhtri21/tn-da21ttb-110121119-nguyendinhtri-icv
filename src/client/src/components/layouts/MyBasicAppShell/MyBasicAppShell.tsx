"use client";
import { MySwitchTheme } from "@/components/ActionIcons/SwitchTheme/MySwitchTheme";
import {
  AppShell,
  Avatar,
  Burger,
  Container,
  Flex,
  Group,
  Menu,
  Text,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useHeadroom } from "@mantine/hooks";
import {
  IconChevronDown,
  IconHeart,
  IconLogout,
  IconMessage,
  IconPlayerPause,
  IconSettings,
  IconStar,
  IconSwitchHorizontal,
  IconTrash,
} from "@tabler/icons-react";
import cx from "clsx";
import { JSX, useState } from "react";
import classes from "./css.module.css";
// import { MantineLogo } from '@mantinex/mantine-logo';

const user = {
  name: "Đình Trí",
  email: "dinhtri@gmail.com",
  image:
    "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-5.png",
};

export function MyBasicAppShell({ children }: { children: React.ReactNode }) {
  const pinned = useHeadroom({ fixedAt: 120 });
  const [opened, { toggle }] = useDisclosure();
  const theme = useMantineTheme();
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  return (
    <AppShell
      header={{ height: 60, collapsed: !pinned, offset: false }}
      // padding="md"
    >
      <AppShell.Header>
        <Container size="80rem" h={60}>
          <Group
            h="100%"
            justify="space-between"
            align="center"
            px={{ base: 20, sm: 0 }}
          >
            {/* Right side */}
            <Flex direction="row" align="center" gap={10}>
              {/* <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            /> */}
              <Text fz={30}>iCV</Text>
            </Flex>
            {/* <Avatar radius="xl">+2</Avatar> */}
            {/* Left side */}
            <Group>
              <MySwitchTheme />
              <Menu
                width={260}
                position="bottom-end"
                transitionProps={{ transition: "pop-top-right" }}
                onClose={() => setUserMenuOpened(false)}
                onOpen={() => setUserMenuOpened(true)}
                withinPortal
              >
                <Menu.Target>
                  <UnstyledButton
                    className={cx(classes.user, {
                      [classes.userActive]: userMenuOpened,
                    })}
                  >
                    <Group gap={7}>
                      <Avatar
                        // src={user.image}
                        alt={user.name}
                        radius="xl"
                        size={35}
                        key={user.name}
                        name={user.name}
                        color="initials"
                        allowedInitialsColors={["blue", "red"]}
                      />
                      <Text fw={500} size="sm" lh={1} mr={3}>
                        {user.name}
                      </Text>
                      <IconChevronDown size={12} stroke={1.5} />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={
                      <IconHeart
                        size={16}
                        color={theme.colors.red[6]}
                        stroke={1.5}
                      />
                    }
                  >
                    Liked posts
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <IconStar
                        size={16}
                        color={theme.colors.yellow[6]}
                        stroke={1.5}
                      />
                    }
                  >
                    Saved posts
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <IconMessage
                        size={16}
                        color={theme.colors.blue[6]}
                        stroke={1.5}
                      />
                    }
                  >
                    Your comments
                  </Menu.Item>

                  <Menu.Label>Settings</Menu.Label>
                  <Menu.Item
                    leftSection={<IconSettings size={16} stroke={1.5} />}
                  >
                    Account settings
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <IconSwitchHorizontal size={16} stroke={1.5} />
                    }
                  >
                    Change account
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconLogout size={16} stroke={1.5} />}
                  >
                    Logout
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Label>Danger zone</Menu.Label>
                  <Menu.Item
                    leftSection={<IconPlayerPause size={16} stroke={1.5} />}
                  >
                    Pause subscription
                  </Menu.Item>
                  <Menu.Item
                    color="red"
                    leftSection={<IconTrash size={16} stroke={1.5} />}
                  >
                    Delete account
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>
      <AppShell.Main px={{ base: 20, sm: 50 }} pt="76px">
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
