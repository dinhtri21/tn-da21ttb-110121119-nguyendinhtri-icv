"use client";
import { MyBasicAppShell } from "@/components/layouts/MyBasicAppShell/MyBasicAppShell";
import MyAuthRouter from "@/providers/MyAuthRouter";
import { ReactNode } from "react";

export default function Layout({ children }: { children?: ReactNode }) {
  // return <MyBasicAppShell>{children}</MyBasicAppShell>;
  return <MyAuthRouter>{children}</MyAuthRouter>;
}
