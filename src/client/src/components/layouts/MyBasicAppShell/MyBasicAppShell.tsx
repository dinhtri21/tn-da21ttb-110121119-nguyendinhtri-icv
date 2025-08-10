"use client";
import { MySwitchTheme } from "@/components/ActionIcons/SwitchTheme/MySwitchTheme";
import { clearToken } from "@/redux/slices/authSlice";
import { clearUser } from "@/redux/slices/userSlide";
import { RootState } from "@/redux/store";
import {
  AppShell,
  Avatar,
  Container,
  Flex,
  Group,
  Menu,
  Text,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useHeadroom } from "@mantine/hooks";
import { IconChevronDown, IconLogout, IconSwitchHorizontal } from "@tabler/icons-react";
import cx from "clsx";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import classes from "./css.module.css";

export function MyBasicAppShell({ children }: { children: React.ReactNode }) {
  const pinned = useHeadroom({ fixedAt: 120 });
  const [opened, { toggle }] = useDisclosure();
  const theme = useMantineTheme();
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const [mounted, setMounted] = useState(false);

  const userState = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    // Only run localStorage operations after component is mounted
    if (mounted) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      dispatch(clearUser());
      dispatch(clearToken());
      router.replace("/auth/login");
    }
  };

  return (
    <AppShell
      header={{ height: 60, collapsed: !pinned, offset: false }}
    >
      <AppShell.Header>
        <Container size="80rem" h={60} px={16}>
          <Group h="100%" justify="space-between" align="center">
            <Flex direction="row" align="center" gap={10}>
              <Text fz={30}>iCV</Text>
            </Flex>
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
                      {mounted && userState.user?.pictureUrl ? (
                        <Avatar
                          src={userState.user?.pictureUrl}
                          alt={userState.user?.name}
                          radius="xl"
                          size={35}
                          key={userState.user?.name}
                          name={userState.user?.name}
                          color="initials"
                          allowedInitialsColors={["blue", "red"]}
                        />
                      ) : (
                        <Avatar
                          alt={userState.user?.name}
                          radius="xl"
                          size={35}
                          key={userState.user?.name}
                          name={userState.user?.name}
                          color="initials"
                          allowedInitialsColors={["blue", "red"]}
                        />
                      )}

                      <Text fw={500} size="sm" lh={1} mr={3}>
                        {userState.user?.name}
                      </Text>
                      <IconChevronDown size={12} stroke={1.5} />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Cài đặt</Menu.Label>
                  <Menu.Item
                    onClick={handleLogout}
                    leftSection={<IconLogout size={16} stroke={1.5} />}
                  >
                    Đăng xuất
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>
      <AppShell.Main pt="61px">{children}</AppShell.Main>
    </AppShell>
  );
}
