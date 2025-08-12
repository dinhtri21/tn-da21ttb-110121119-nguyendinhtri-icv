"use client";
import { ICV } from "@/interface/cv";
import cvService from "@/api/services/cvService";
import {
  ActionIcon,
  Box,
  Button,
  Flex,
  Group,
  Paper,
  Switch,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import React, { use, useEffect, useState } from "react";
import { IconCheck, IconCopy, IconShare } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";

interface ShareTabProps {
  cv: ICV;
  onCvUpdated: (updatedCv: ICV) => void;
}

export default function ShareTab({ cv, onCvUpdated }: ShareTabProps) {
  const [isPublic, setIsPublic] = useState<boolean>(cv?.status === "public");
  const [copied, setCopied] = useState(false);
  const theme = useMantineTheme();

  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      if (!cv || !cv.id) throw new Error("Thiếu thông tin CV hoặc ID");
      const updatedCv: ICV = {
        ...cv,
        status: isPublic ? "private" : "public",
      };
      const response = await cvService.updateCV(cv.id, updatedCv);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.isSuccess && data.data) {
        setIsPublic(data.data.status === "public");
        onCvUpdated(data.data);
        notifications.show({
          title: "Thành công",
          message: `CV đã được ${data.data.status === "public" ? "công khai" : "đặt riêng tư"}`,
          color: "green",
        });
      }
    },
    onError: (error) => {
      console.error("Failed to update CV status:", error);
      notifications.show({
        title: "Lỗi",
        message: "Không thể cập nhật trạng thái CV",
        color: "red",
      });
    },
  });

  const togglePublicStatus = () => {
    updateStatusMutation.mutate();
  };

  const publicUrl =
    typeof window !== "undefined" ? `${window.location.origin}/public-cv/${cv?.id}` : "";

  const copyToClipboard = () => {
    if (navigator.clipboard && publicUrl) {
      navigator.clipboard.writeText(publicUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        notifications.show({
          title: "Đã sao chép",
          message: "Đường dẫn đã được sao chép vào clipboard",
          color: "green",
        });
      });
    }
  };

  useEffect(() => {
    setIsPublic(cv?.status === "public");
  }, [cv]);

  return (
    <Box>
      <Paper p="md" withBorder mb="md">
        <Group justify="space-between" gap={4}>
          <Box>
            <Text fz={"sm"} fw={500}>
              Trạng thái chia sẻ
            </Text>
            <Text size="xs" c="gray.6" mb="md">
              {isPublic
                ? "CV được công khai và có thể xem bởi bất kỳ ai có đường dẫn"
                : "CV ở chế độ riêng tư và chỉ bạn mới có thể xem"}
            </Text>
          </Box>
          <Switch
            checked={isPublic}
            onChange={togglePublicStatus}
            disabled={updateStatusMutation.isPending}
            color={isPublic ? "blue" : "gray"}
            label={isPublic ? "Công khai" : "Riêng tư"}
            labelPosition="left"
          />
        </Group>
      </Paper>

      {isPublic && (
        <Paper p="md" withBorder>
          <Text fz={"sm"} fw={500} >
            Đường dẫn chia sẻ
          </Text>
          <Text size="xs" c="gray.6" mb="md">
            Sử dụng đường dẫn này để chia sẻ CV của bạn với người khác
          </Text>

          <Flex gap="xs">
            <TextInput size="xs" readOnly value={publicUrl} style={{ flexGrow: 1 }} />
            <ActionIcon onClick={copyToClipboard} color={copied ? "green" : "blue"}>
              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
            </ActionIcon>
          </Flex>
        </Paper>
      )}
    </Box>
  );
}
