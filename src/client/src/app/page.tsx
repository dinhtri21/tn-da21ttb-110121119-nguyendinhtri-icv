"use client";

import { clearToken, setToken } from "@/redux/slices/authSlice";
import { RootState } from "@/redux/store";
import { AppShell, Button, Container, Flex, Group, Image, Text } from "@mantine/core";
import { useHeadroom } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

export default function HomePage() {
  let tokenLocalStorage: string | null = null;
  if (typeof window !== "undefined") {
    tokenLocalStorage = localStorage.getItem("authToken");
  }
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();
  const Router = useRouter();

  const handleLogin = () => {
    const fakeToken = "abc123xyz456"; // Giả lập token
    dispatch(setToken(fakeToken)); // Lưu token vào Redux
  };

  const handleLogout = () => {
    dispatch(clearToken()); // Xóa token khỏi Redux
  };

  const pinned = useHeadroom({ fixedAt: 120 });

  // useEffect(() => {
  //   if (token == null || token == "") {
  //     if (tokenLocalStorage == null || token == "") {
  //       Router.push("auth/login");
  //       return;
  //     } else {
  //       dispatch(setToken(tokenLocalStorage));
  //     }
  //   }
  //   console.log(token);
  // }, [token]);

  return (
    <AppShell header={{ height: 60, collapsed: !pinned, offset: false }}>
      <AppShell.Header>
        <Container size="80rem" h={60} px={16}>
          <Group h="100%" justify="space-between" align="center">
            <Flex direction="row" align="center" gap={10}>
              <Text fz={30}>iCV</Text>
            </Flex>
            <Group>
              <Button variant="light" onClick={() => Router.push("/auth/login")}>
                Đăng ký
              </Button>
              <Button onClick={() => Router.push("/auth/login")}>Đăng nhập</Button>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>
      <AppShell.Main pt="76px">
        <Container size="80rem" px={16} pb="100px">
          <Flex direction="column" align="center" justify="center" py="80px">
            <Text fz="h1" fw={600} className="font-sansfont-serif">
              Tìm công việc mơ ước
            </Text>
            <Text fz="h1" fw={600} ta="center">
              với trình tạo CV được{" "}
              <Text span fz="h1" fw={600} c="blue">
                hỗ trợ bởi AI
              </Text>{" "}
              của chúng tôi.
            </Text>
            <Text fz="xl" c="gray.7" ta="center">
              Tạo CV chuyên nghiệp với công cụ miễn phí và chia sẻ dễ dàng qua liên kết.
            </Text>
            <Button variant="light" mt="10px" fz="xl" fw={400}>
              Bắt đầu ngay !
            </Button>
          </Flex>
          <Flex direction="row" align="center" justify="center" py="20px">
            <div className="w-full relative max-w-5xl mx-auto px-4 md:px-6 lg:px-8">
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-full h-[400px] bg-gradient-to-r from-blue-800 to-blue-500 rounded-full blur-3xl opacity-40 z-0" />
              <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-xl shadow-lg bg-background">
                <div className="relative w-full h-full rounded-md">
                  <Image
                    src="https://cvbuild-ai.vercel.app/_next/image?url=%2Fimages%2Fboard-img.png&w=1920&q=75"
                    alt="App dashboard"
                    className="object-contain w-full h-full rounded-md"
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
