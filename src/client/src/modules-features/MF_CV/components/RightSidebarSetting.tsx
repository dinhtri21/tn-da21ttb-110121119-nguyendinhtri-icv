import cvService from "@/api/services/cvService";
import { ICV } from "@/interface/cv";
import { clearToken } from "@/redux/slices/authSlice";
import { clearUser } from "@/redux/slices/userSlide";
import { RootState } from "@/redux/store";
import {
  ActionIcon,
  Avatar,
  Button,
  Flex,
  Group,
  Menu,
  Text,
  Tooltip,
  UnstyledButton,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconChevronDown,
  IconDownload,
  IconInputAi,
  IconLogout,
  IconMoon,
  IconSquares,
  IconSun,
  IconSwitchHorizontal,
} from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import cx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import classes from "./css.module.css";

export default function RightSidebarSetting({
  printRef,
  cv,
}: {
  printRef?: React.RefObject<HTMLDivElement>;
  cv?: ICV;
}) {
  const [isExporting, setIsExporting] = useState(false);
  const editableRef = useRef<HTMLDivElement>(null);
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  const mutate = useMutation({
    mutationFn: async (cv: ICV) => {
      if (!cv.id) throw new Error("CV ID is required");
      return await cvService.updateCV(cv.id, cv);
    },
    onSuccess: () => {
      notifications.show({
        title: "Thành công",
        message: "Cập nhật CV thành công!",
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Lỗi",
        message: "Không thể cập nhật CV. Vui lòng thử lại sau.",
        color: "red",
      });
    },
  });

  if (editableRef.current) {
    if (cv && cv.fileName) {
      editableRef.current.innerText = cv.fileName || "Chưa đặt tên";
    }
  }
  // Move useReactToPrint hook to component level
  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const handleSaveCV = () => {
    if (cv) {
      mutate.mutate(cv);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (cv && cv.fileName) {
      const text = e.currentTarget.innerText;
      cv.fileName = text;
    }
  };

  // user
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const userState = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      dispatch(clearUser());
      dispatch(clearToken());
      window.location.replace("/auth/login");
    }
  };

  return (
    <Flex flex={1} direction="column" gap={8}>
      <Group flex={1} justify="space-between" align="center">
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
              className={cx(classes.user, {
                [classes.userActive]: userMenuOpened,
              })}
            >
              <Group gap={7}>
                {userState && userState.user?.pictureUrl ? (
                  <Avatar
                    src={userState.user?.pictureUrl}
                    alt={userState.user?.name}
                    radius="xl"
                    size={30}
                    key={userState.user?.name}
                    name={userState.user?.name}
                    color="initials"
                    allowedInitialsColors={["blue", "red"]}
                  />
                ) : (
                  <Avatar
                    alt={userState.user?.name}
                    radius="xl"
                    size={30}
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
              onClick={() => window.location.replace("/my-cv")}
              leftSection={<IconSquares size={16} stroke={1.5} />}
            >
              Quản lý CV
            </Menu.Item>
            <Menu.Item onClick={handleLogout} leftSection={<IconLogout size={16} stroke={1.5} />}>
              Đăng xuất
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        <Group gap={4}>
          <ActionIcon
            onClick={() => setColorScheme(computedColorScheme === "light" ? "dark" : "light")}
            variant="default"
            size="30px"
            aria-label="Toggle color scheme"
          >
            {computedColorScheme === "light" ? (
              <IconSun stroke={1.5} size={18} />
            ) : (
              <IconMoon stroke={1.5} size={18} />
            )}
          </ActionIcon>
          <Tooltip
            label={
              <Text size="xs">
                Vui lòng chọn &apos;Lưu dưới dạng PDF&apos; hoặc &apos;Save as PDF&apos; trong hộp thoại In.
              </Text>
            }
          >
            <Button
              onClick={() => {
                handlePrint();
              }}
              size="xs"
              // leftSection={<IconDownload size={16} />}
              color="green"
              variant="outline"
              loading={isExporting}
              disabled={isExporting}
            >
              {isExporting ? "Đang tải..." : "Tải xuống"}
            </Button>
          </Tooltip>
          <Button size="xs" color="green" onClick={handleSaveCV}>
            Lưu
          </Button>
        </Group>
      </Group>
    </Flex>
  );
}
