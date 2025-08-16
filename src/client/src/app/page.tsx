"use client";

import { clearToken, setToken } from "@/redux/slices/authSlice";
import { clearUser, setUser } from "@/redux/slices/userSlide";
import { RootState } from "@/redux/store";
import {
  AppShell,
  Avatar,
  Button,
  Container,
  Flex,
  Group,
  Image,
  Menu,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useHeadroom } from "@mantine/hooks";
import { IconChevronDown, IconSwitchHorizontal, IconLogout, IconSquares } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function HomePage() {
  let tokenLocalStorage: string | null = null;
  let userDataLocalStorage: any = null;
  if (typeof window !== "undefined") {
    tokenLocalStorage = localStorage.getItem("authToken");
    const userDataString = localStorage.getItem("userData");
    userDataLocalStorage = userDataString ? JSON.parse(userDataString) : null;
  }
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const Router = useRouter();

  const handleLogin = () => {
    const fakeToken = "abc123xyz456"; // Giả lập token
    dispatch(setToken(fakeToken)); // Lưu token vào Redux
  };

  // const handleLogout = () => {
  //   dispatch(clearToken()); // Xóa token khỏi Redux
  // };

  const pinned = useHeadroom({ fixedAt: 120 });

  // user
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const userState = useSelector((state: RootState) => state.user);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      dispatch(clearUser());
      dispatch(clearToken());
      // window.location.replace("/auth/login");
    }
  };

  // Khôi phục thông tin đăng nhập từ localStorage vào Redux khi trang được tải
  useEffect(() => {
    // Nếu không có token trong Redux nhưng có trong localStorage
    if (!token && tokenLocalStorage && userDataLocalStorage) {
      dispatch(setToken(tokenLocalStorage));
      dispatch(setUser(userDataLocalStorage));
    }
  }, [token, tokenLocalStorage, userDataLocalStorage, dispatch]);

  return (
    <AppShell header={{ height: 60, collapsed: !pinned, offset: false }}>
      <AppShell.Header>
        <Container size="80rem" h={60} px={16}>
          <Group h="100%" justify="space-between" align="center">
            <Flex direction="row" align="center" gap={10}>
              <Text fz={30}>iCV</Text>
            </Flex>
            <Group>
              {user ? (
                <Menu
                  width={260}
                  // position="bottom-end"
                  transitionProps={{ transition: "pop-top-right" }}
                  onClose={() => setUserMenuOpened(false)}
                  onOpen={() => setUserMenuOpened(true)}
                  withinPortal
                >
                  <Menu.Target>
                    <UnstyledButton
                    // className={cx(classes.user, {
                    //   [classes.userActive]: userMenuOpened,
                    // })}
                    >
                      <Group gap={7}>
                        {userState && userState.user?.PictureUrl ? (
                          <Avatar
                            src={userState.user?.PictureUrl}
                            alt={userState.user?.Name}
                            radius="xl"
                            size={35}
                            key={userState.user?.Name}
                            name={userState.user?.Name}
                            color="initials"
                            allowedInitialsColors={["blue", "red"]}
                          />
                        ) : (
                          <Avatar
                            alt={userState.user?.Name}
                            radius="xl"
                            size={35}
                            key={userState.user?.Name}
                            name={userState.user?.Name}
                            color="initials"
                            allowedInitialsColors={["blue", "red"]}
                          />
                        )}

                        <Text fw={500} size="sm" lh={1} mr={3}>
                          {userState.user?.Name}
                        </Text>
                        <IconChevronDown size={12} stroke={1.5} />
                      </Group>
                    </UnstyledButton>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>Cài đặt</Menu.Label>
                    <Menu.Item
                      onClick={() => window.location.replace("/my-cv")}
                      leftSection={<IconSquares size={16} stroke={1.5} />}
                    >
                      Quản lý CV
                    </Menu.Item>
                    <Menu.Item
                      onClick={handleLogout}
                      leftSection={<IconLogout size={16} stroke={1.5} />}
                    >
                      Đăng xuất
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              ) : (
                <>
                  <Button size="xs" variant="light" onClick={() => Router.push("/auth/register")}>
                    Đăng ký
                  </Button>
                  <Button size="xs" onClick={() => Router.push("/auth/login")}>Đăng nhập</Button>
                </>
              )}
            </Group>
          </Group>
        </Container>
      </AppShell.Header>
      <AppShell.Main pt="76px">
        <Container size="80rem" px={16} pb="100px">
          <Flex direction="column" align="center" justify="center" py="40px">
            <Text fz="30px" fw={600} className="font-sansfont-serif">
              Tìm công việc mơ ước
            </Text>
            <Text fz="30px" fw={600} ta="center">
              với trình tạo CV được{" "}
              <Text span fz="30px" fw={600} c="blue">
                hỗ trợ bởi AI
              </Text>{" "}
              của chúng tôi.
            </Text>
            <Text fz="18px" c="gray.7" ta="center">
              Tạo CV chuyên nghiệp với công cụ miễn phí và chia sẻ dễ dàng qua liên kết.
            </Text>
            <Button size="xs" variant="light" mt="10px" fz="16px" fw={400}>
              Bắt đầu ngay !
            </Button>
          </Flex>
          <Flex direction="row" align="center" justify="center" py="20px">
            <div className="w-full relative max-w-5xl mx-auto px-4 md:px-6 lg:px-8">
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-full h-[400px] bg-gradient-to-r from-blue-800 to-blue-500 rounded-full blur-3xl opacity-40 z-0" />
              <div className="w-full  rounded-xl shadow-lg bg-background">
                <div className="relative w-full rounded-md">
                  <Image
                    src="/images/iCV_home.png"
                    alt="App dashboard"
                    className="object-cover w-full h-full rounded-md"
                    radius="md"
                  />
                </div>
              </div>
            </div>
          </Flex>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
