import { ReactNode } from "react";
import MyAuthRouter from "./MyAuthRouter";
import MyMantineProvider from "./MyMantineProvider";
import MyReactQueryProvider from "./MyReactQueryProvider";

export default function MyProvider({ children }: { children?: ReactNode }) {
  return (
    <MyReactQueryProvider>
      <MyMantineProvider>
        <MyAuthRouter>{children}</MyAuthRouter>
      </MyMantineProvider>
    </MyReactQueryProvider>
  );
}
