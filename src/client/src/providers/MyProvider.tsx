import { ReactNode } from "react";
import MyMantineProvider from "./MyMantineProvider";
import MyReactQueryProvider from "./MyReactQueryProvider";
import MyAuthRouter from "./MyAuthRouter";

export default function MyProvider({ children }: { children?: ReactNode }) {
  return (
    <MyReactQueryProvider>
      <MyMantineProvider>
        <MyAuthRouter>{children}</MyAuthRouter>
      </MyMantineProvider>
    </MyReactQueryProvider>
  );
}
