"use client";

import { ModalsProvider } from "@mantine/modals";
import { createTheme, MantineProvider } from "@mantine/core";

export default function MyMantineProvider({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider defaultColorScheme="light">
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
