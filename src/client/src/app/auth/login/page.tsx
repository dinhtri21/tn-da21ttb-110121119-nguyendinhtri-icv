"use client";

import { authService } from "@/api/services/authService";
import { setToken } from "@/redux/slices/authSlice";
import { setUser } from "@/redux/slices/userSlide";
import {
  ActionIcon,
  Anchor,
  Button,
  Center,
  Checkbox,
  Divider,
  Flex,
  Group,
  LoadingOverlay,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { upperFirst, useDisclosure, useToggle } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

export default function AuthenticationForm() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { setColorScheme } = useMantineColorScheme();
  const [visible, { open: showOverlay, close: hideOverlay }] = useDisclosure(false);
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
      password: (val) => (val.length <= 2 ? "Password should include at least 2 characters" : null),
    },
  });

  const handleSignUp = async (values: typeof form.values) => {
    try {
      showOverlay();
      const res = await authService.signUp({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (res.status === 200 && res.data.isSuccess) {
        notifications.show({
          title: "Đăng ký thành công",
          message: `Bây giờ bạn có thể tiến hành đăng nhập vào iCV!`,
          color: "green",
        });

        // Chuyển hướng về dashboard
        router.replace("/dashboard");
      } else {
        notifications.show({
          title: "Lỗi đăng ký",
          message: res.data.message || "Có lỗi xảy ra trong quá trình đăng ký",
          color: "red",
        });
      }
    } catch (error: any) {
      notifications.show({
        title: "Lỗi đăng ký",
        message:
          error.response?.data?.message || error.message || "Có lỗi xảy ra trong quá trình đăng ký",
        color: "red",
      });
    } finally {
      hideOverlay(); // Ẩn loading khi hoàn thành
    }
  };

  const handleLogin = async (values: typeof form.values) => {
    try {
      showOverlay();
      const res = await authService.login({
        email: values.email,
        password: values.password,
      });

      if (res.status === 200 && res.data.isSuccess) {
        if (res.data?.data?.token && res.data?.data?.user) {
          // Lưu thông tin đăng nhập
          localStorage.setItem("authToken", res.data.data.token);
          localStorage.setItem("userData", JSON.stringify(res.data.data.user));

          // Cập nhật Redux state
          dispatch(setToken(res.data.data.token));
          dispatch(setUser(res.data.data.user));
        }

        notifications.show({
          title: "Đăng nhập thành công",
          message: `Chào mừng bạn đến với iCV!`,
          color: "green",
        });

        // Chuyển hướng về dashboard
        router.replace("/dashboard");
      } else {
        notifications.show({
          title: "Lỗi đăng nhập",
          message: res.data.message || "Có lỗi xảy ra trong quá trình đăng nhập",
          color: "red",
        });
      }
    } catch (error: any) {
      notifications.show({
        title: "Lỗi đăng nhập",
        message:
          error.response?.data?.message ||
          error.message ||
          "Có lỗi xảy ra trong quá trình đăng nhập",
        color: "red",
      });
    } finally {
      hideOverlay(); // Ẩn loading khi hoàn thành
    }
  };

  const handleGoogleLogin = async () => {
    try {
      showOverlay();
      
      // Đảm bảo rằng overlay được hiển thị trước khi tiếp tục
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Lấy URL đăng nhập Google
      const res = await authService.getGoogleLoginUrl();
      const googleUrl = res.data.redirectUrl;

      // Thiết lập popup window
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      // Biến global để kiểm soát popup
      let googleLoginPopup: Window | null = null;
      let popupCloseCheckInterval: NodeJS.Timeout | null = null;
      
      // Thiết lập xử lý sự kiện trước
      const handleMessage = (event: MessageEvent) => {
        // Kiểm tra origin để bảo mật
        if (event.origin !== window.location.origin) {
          return;
        }

        const { success, token, user, error } = event.data || {};

        if (error) {
          console.error("Google login error:", error);
          notifications.show({
            title: "Lỗi đăng nhập",
            message: getErrorMessage(error),
            color: "red",
          });
          cleanup();
          return;
        }

        if (success && token && user) {
          // Lưu thông tin đăng nhập
          localStorage.setItem("authToken", token);
          localStorage.setItem("userData", JSON.stringify(user));

          // Cập nhật Redux state
          dispatch(setToken(token));
          dispatch(setUser(user));

          notifications.show({
            title: "Đăng nhập thành công",
            message: `Chào mừng đến với iCV!`,
            color: "green",
          });

          // Chuyển hướng về my-cv
          router.replace("/my-cv");
          
          // Dọn dẹp
          cleanup();
        }
      };

      // Đăng ký event listener trước khi mở popup
      window.addEventListener("message", handleMessage);

      // Phương thức cleanup để đảm bảo dọn dẹp tất cả resources
      let cleanup = () => {
        // Hủy event listener
        window.removeEventListener("message", handleMessage);
        
        // Hủy interval kiểm tra popup
        if (popupCloseCheckInterval) {
          clearInterval(popupCloseCheckInterval);
          popupCloseCheckInterval = null;
        }
        
        // Đóng popup nếu còn mở
        if (googleLoginPopup && !googleLoginPopup.closed) {
          try {
            googleLoginPopup.close();
          } catch (e) {
            console.log("Không thể đóng popup");
          }
        }
        
        // Ẩn overlay
        hideOverlay();
      };

      // Sử dụng requestAnimationFrame để đảm bảo UI đã được cập nhật
      requestAnimationFrame(() => {
        // Mở popup trong user interaction event loop
        googleLoginPopup = window.open(
          googleUrl,
          "GoogleLogin",
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,status=yes`
        );

        if (!googleLoginPopup) {
          notifications.show({
            title: "Lỗi",
            message: "Popup bị chặn bởi trình duyệt. Vui lòng cho phép popup và thử lại.",
            color: "red",
          });
          cleanup();
          return;
        }

        // Đặt focus vào popup
        try {
          googleLoginPopup.focus();
        } catch (e) {
          console.log("Không thể focus vào popup");
        }

        // Đặt lịch kiểm tra popup có bị đóng không
        popupCloseCheckInterval = setInterval(() => {
          if (!googleLoginPopup || googleLoginPopup.closed) {
            console.log("Popup đã bị đóng bởi người dùng");
            cleanup();
          }
        }, 500);
        
        // Thiết lập timeout để tự động đóng popup nếu không có phản hồi sau một thời gian
        setTimeout(() => {
          if (googleLoginPopup && !googleLoginPopup.closed) {
            console.log("Popup timeout - không có phản hồi sau thời gian chờ");
            notifications.show({
              title: "Đăng nhập thất bại",
              message: "Không nhận được phản hồi từ Google. Vui lòng thử lại.",
              color: "orange",
            });
            cleanup();
          }
        }, 120000); // 2 phút timeout
      });
      
      // Thêm event handler để xử lý nếu người dùng rời khỏi trang
      const handleBeforeUnload = () => {
        cleanup();
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      // Thêm vào cleanup để hủy event handler khi rời trang
      const originalCleanup = cleanup;
      cleanup = () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        originalCleanup();
      };
      
    } catch (error) {
      console.error("Login failed:", error);
      notifications.show({
        title: "Lỗi",
        message: error instanceof Error ? error.message : "Không thể khởi tạo đăng nhập Google",
        color: "red",
      });
      hideOverlay();
    }
  };

  const getErrorMessage = (error: string) => {
    const errorMessages = {
      invalid_state: "Phiên đăng nhập không hợp lệ",
      session_expired: "Phiên đăng nhập đã hết hạn",
      missing_code: "Thiếu mã xác thực",
      token_exchange_failed: "Không thể trao đổi token",
      user_info_failed: "Không thể lấy thông tin người dùng",
      authentication_failed: "Xác thực thất bại",
      access_denied: "Người dùng từ chối truy cập",
    };
    return (
      errorMessages[error as keyof typeof errorMessages] ||
      "Có lỗi xảy ra trong quá trình đăng nhập"
    );
  };

  return (
    <Center h="100vh" w="100vw">
      <Paper radius="md" p="xl" withBorder miw={360} pos="relative" shadow="md">
        <LoadingOverlay
          visible={visible}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
          loaderProps={{ color: "blue", type: "bars" }}
        />

        <Flex direction="row" justify="space-between" mb="xl">
          <Text size="lg" fw={500}>
            Chào mừng đến với iCV
          </Text>
          <ActionIcon
            onClick={() => setColorScheme(computedColorScheme === "light" ? "dark" : "light")}
            variant="default"
            size="lg"
            aria-label="Toggle color scheme"
          >
            {computedColorScheme === "light" ? <IconSun stroke={1.5} /> : <IconMoon stroke={1.5} />}
          </ActionIcon>
        </Flex>

        <Text size="sm" fw={400} c="gray">
          {type} với
        </Text>

        <Group grow mb="md" mt="md">
          <Button
            variant="default"
            w="100%"
            radius="xl"
            onClick={handleGoogleLogin}
            disabled={visible}
          >
            <img src="/icons/google.svg" alt="Google" width={16} height={16} />
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

        <form
          onSubmit={form.onSubmit(() => {
            if (type === "Đăng ký") {
              return handleSignUp(form.values);
            }
            return handleLogin(form.values);
          })}
        >
          <Stack>
            {type === "Đăng ký" && (
              <TextInput
                label="Tên"
                placeholder="Nhập tên của bạn"
                value={form.values.name}
                onChange={(event) => form.setFieldValue("name", event.currentTarget.value)}
                radius="md"
              />
            )}

            <TextInput
              required
              label="Email"
              placeholder="hello@example.com"
              value={form.values.email}
              onChange={(event) => form.setFieldValue("email", event.currentTarget.value)}
              error={form.errors.email && "Email không hợp lệ"}
              radius="md"
            />

            <PasswordInput
              required
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              value={form.values.password}
              onChange={(event) => form.setFieldValue("password", event.currentTarget.value)}
              error={form.errors.password && "Mật khẩu phải có ít nhất 2 ký tự"}
              radius="md"
            />

            {type === "Đăng ký" && (
              <Checkbox
                label="Tôi đồng ý với điều khoản và điều kiện"
                checked={form.values.terms}
                onChange={(event) => form.setFieldValue("terms", event.currentTarget.checked)}
              />
            )}
          </Stack>

          <Group justify="space-between" mt="xl">
            <Anchor component="button" type="button" c="dimmed" onClick={() => toggle()} size="xs">
              {type === "Đăng ký" ? "Đã có tài khoản? Đăng nhập" : "Chưa có tài khoản? Đăng ký"}
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
