import { IconHome, IconFolderOpen, IconTrash } from "@tabler/icons-react";

export const menuData = [
  {
    label: "Trang chủ",
    // iconTabler: "IconHome",
    iconElement: <IconHome size={16} stroke={1.5} />,
    link: "",
  },
  {
    label: "Dự án",
    link: "projects",
    // status: "Prototype",
    // iconTabler: "IconFolderOpen",
    iconElement: <IconFolderOpen size={16} stroke={1.5} />,
    links: [
      { label: "Tất cả dự án", link: "projects", status: "Menu" },
      { label: "Nháp", link: "1-1", status: "Menu" },
      {
        label: "Thùng rác",
        link: "1-2",
        status: "Menu",
        iconElement: <IconTrash size={16} stroke={1.5} />,
      },
    ],
  },
];
