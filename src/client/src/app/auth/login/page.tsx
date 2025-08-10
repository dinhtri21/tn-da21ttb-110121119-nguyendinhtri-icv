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
        passWord: values.password,
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
        passWord: values.password,
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
          message: `Chào mừng ${res.data?.data?.user?.name}!`,
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
    showOverlay();
    try {
      const res = await authService.getGoogleLoginUrl();
      const googleUrl = res.data.redirectUrl;

      // Tạo popup window
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        googleUrl,
        "GoogleLogin",
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );

      if (!popup) {
        throw new Error("Popup bị chặn bởi trình duyệt");
      }

      // Lắng nghe message từ popup
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
          hideOverlay();
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
            message: `Chào mừng ${user.name}!`,
            color: "green",
          });

          // Chuyển hướng về my-cv
          router.replace("/my-cv");
        }

        hideOverlay();
        cleanup();
      };

      // Kiểm tra khi popup đóng
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          hideOverlay();
          cleanup();
        }
      }, 1000);

      const cleanup = () => {
        window.removeEventListener("message", handleMessage);
        clearInterval(checkClosed);
        if (popup && !popup.closed) {
          popup.close();
        }
      };

      window.addEventListener("message", handleMessage);

      // Timeout sau 5 phút
      setTimeout(() => {
        if (popup && !popup.closed) {
          popup.close();
        }
        hideOverlay();
        cleanup();
        notifications.show({
          title: "Timeout",
          message: "Quá trình đăng nhập đã hết thời gian",
          color: "orange",
        });
      }, 300000); // 5 phút
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
      <Paper radius="md" p="xl" withBorder miw={360} pos="relative">
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
