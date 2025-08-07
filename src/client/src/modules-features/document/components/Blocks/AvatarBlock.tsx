import avatarService from "@/api/services/avatarService";
import cvService from "@/api/services/cvService";
import { IAvatar, ICV } from "@/interface/cv";
import { notifications } from "@mantine/notifications";
import { IconUpload, IconUserCircle } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

interface AvatarBlockProps {
  value: ICV;
  setCvData: React.Dispatch<React.SetStateAction<ICV>>;
}

export function AvatarBlock({ value, setCvData }: AvatarBlockProps) {
  const [avatar, setAvatar] = useState<IAvatar>({
    file: value.avatar?.file || undefined,
    path: value.avatar?.path || "",
    fileName: value.avatar?.fileName || "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const path = reader.result as string;

        const form = new FormData();
        form.append("file", file);
        form.append("fileName", file.name);
        form.append("CVId", value.id || "");
        // Gọi API để lưu avatar
        await avatarService
          .createAvatar(form)
          .then((e) => {
            notifications.show({
              title: "Thành công",
              message: "Đăng tải ảnh đại diện thành công!",
              color: "green",
            });
            setCvData((prevData) => ({
              ...prevData,
              avatar: {
                fileName: e.data.fileName,
                path: e.data.path,
              }, 
            })); 
          })
          .catch((error) => {
            notifications.show({
              title: "Lỗi",
              message: "Không thể đăng tải ảnh đại diện. Vui lòng thử lại sau.",
              color: "red",
            });
          });
      };
      reader.readAsDataURL(file);
    }
  };

  // Đồng bộ state khi có thay đổi
  useEffect(() => {
    setCvData((prev) => ({
      ...prev,
      avatar: avatar,
    }));
  }, [avatar, setCvData]);

  return (
    <div className="hover:border flex items-center justify-center hover:border-gray-300 bg-transparent border border-transparent p-1 rounded-md focus-within:border focus-within:border-gray-300">
      <div
        className="relative flex items-center justify-center bg-transparent w-40 h-40 mx-auto cursor-pointer group border-[4px] border-gray-300 rounded-full"
        onClick={handleImageClick}
      >
        {/* Ảnh hiển thị */}
        {value.avatar?.path ? (
          <img
            src={`${process.env.NEXT_PUBLIC_API}${value.avatar.path}`}
            alt="Avatar"
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
            <IconUserCircle size={80} className="text-gray-400" />
          </div>
        )}

        {/* Overlay khi hover */}
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
          <IconUpload size={24} className="text-white" />
        </div>

        {/* Input file ẩn */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
