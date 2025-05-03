"use client";
import {
  AppShell,
  Avatar,
  Badge,
  Burger,
  Flex,
  Group,
  Menu,
  NavLink,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Text } from "@mantine/core";
import { usePathname } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ComponentType, JSX, useState } from "react";
import cx from 'clsx';
import classes from './css.module.css';
import { IconChevronDown, IconHeart, IconLogout, IconMessage, IconPlayerPause, IconSettings, IconStar, IconSwitchHorizontal, IconTrash } from "@tabler/icons-react";
// import { MantineLogo } from '@mantinex/mantine-logo';
export interface I0LinkItem {
  id?: number;
  englishLabel?: string;
  label: string;
  // status?: "Default" | "Prototype" | "New" | "Menu";
  link?: string;
  links?: I0LinkItem[];
  iconTabler?: string;
  iconElement?: JSX.Element;
}

const user = {
  name: 'Jane Spoonfighter',
  email: 'janspoon@fighter.dev',
  image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-5.png',
};


export function MyBasicAppShell({
  children,
  menu,
}: {
  children: React.ReactNode;
  menu: I0LinkItem[];
}) {
  const [opened, { toggle }] = useDisclosure();
  const theme = useMantineTheme();
  const [userMenuOpened, setUserMenuOpened] = useState(false);


  function getRightSection(status: string) {
    if (status === "Prototype")
      return (
        <Badge
          styles={{ root: { cursor: "pointer" } }}
          radius="xs"
          color="pink"
          circle
        >
          P
        </Badge>
      );
    if (status === "New")
      return (
        <Badge styles={{ root: { cursor: "pointer" } }} radius="xs" circle>
          N
        </Badge>
      );
    if (status === "Menu")
      return (
        <Badge
          styles={{ root: { cursor: "pointer" } }}
          radius="xs"
          color="gray"
          circle
        >
          M
        </Badge>
      );
    return null; // Fallback for unknown types
  }

  // Recursive function to render nested links
  function RenderNavLinks({ items }: { items: I0LinkItem[] }) {
    // const SidebarStore = useS_Sidebar()
    const pathName = usePathname();
    console.log("pathName", pathName.split("/")[1]);
    return (
      <>
        {items.map((item, index) => (
          <NavLink
            // active={item.link === pathName.split("/")[2]}
            active={item.link === pathName.split("/")[1]}
            component={Link}
            key={index}
            // rightSection={
            //     getRightSection(item.status!)
            // }

            leftSection={item.iconElement}
            // opened={SidebarStore.groupMenuOpenId.includes(item.label)}
            // href={`${item.link}` || "#"}
            // href={
            //   pathName.split("/")[0] +
            //   "/" +
            //   pathName.split("/")[1] +
            //   "/" +
            //   item.link
            // }
            href={pathName.split("/")[0] + "/" + item.link}
            label={item.label}
            childrenOffset={28}
            // rightSection={item.link && "prototype"}
            // onClick={() => {
            //     if (item.links) SidebarStore.toggleGroupMenuOpenId(item.label)
            //     if (item.link) {
            //         SidebarStore.setMenuCode(item.link)
            //         SidebarStore.setTitle(item.label)
            //     }
            // }}
          >
            {item.links && <RenderNavLinks items={item.links} />}
          </NavLink>
        ))}
      </>
    );
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 220, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" align="center">
          <Flex direction="row" align="center" gap={10}>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Text fz={30}>iCV</Text>
          </Flex>
          {/* <Avatar radius="xl">+2</Avatar> */}
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
                    src={user.image}
                    alt={user.name}
                    radius="xl"
                    size={24}
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
              <Menu.Item leftSection={<IconSettings size={16} stroke={1.5} />}>
                Account settings
              </Menu.Item>
              <Menu.Item
                leftSection={<IconSwitchHorizontal size={16} stroke={1.5} />}
              >
                Change account
              </Menu.Item>
              <Menu.Item leftSection={<IconLogout size={16} stroke={1.5} />}>
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
      </AppShell.Header>
      <AppShell.Navbar >
        <RenderNavLinks items={menu} />
        {/* {Array(15)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} h={28} mt="sm" animate={false} />
          ))} */}
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
