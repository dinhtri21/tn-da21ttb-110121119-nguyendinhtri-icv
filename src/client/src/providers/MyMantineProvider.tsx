"use client";

import { ModalsProvider } from "@mantine/modals";
import { createTheme, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

export default function MyMantineProvider({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider defaultColorScheme="light">
      <Notifications />
      {/* <ModalsProvider
        labels={{
          confirm: "Thêm",
          cancel: "Huỷ",
        }}
      > */}
      {/* <Notifications /> */}
      {children}
      {/* </ModalsProvider> */}
    </MantineProvider>
  );
}
const theme = createTheme({
  /** Put your mantine theme override here */
});
