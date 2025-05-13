"use client";
import { MyBasicAppShell } from "@/components/layouts/MyBasicAppShell/MyBasicAppShell";
import { ReactNode } from "react";

export default function Layout({ children }: { children?: ReactNode }) {
  return <MyBasicAppShell>{children}</MyBasicAppShell>;
}
