export const menuData = [
  {
    label: "Trang chủ",
    iconTabler: "IconHome",
    link: "",
  },
  {
    label: "Dự án",
    link: "projects",
    // status: "Prototype",
    iconTabler: "IconFolderOpen",
    links: [
      { label: "Tất cả dự án", link: "projects", status: "Menu" },
      { label: "Nháp", link: "1-1", status: "Menu" },
      { label: "Thùng rác", link: "1-2", status: "Menu", iconTabler: "IconTrash" },
    ],
  },
];
