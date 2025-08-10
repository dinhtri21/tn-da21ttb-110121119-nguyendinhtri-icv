"use client";
import MyAuthRouter from "@/providers/MyAuthRouter";
import { ReactNode } from "react";

export default function Layout({ children }: { children?: ReactNode }) {
  return <MyAuthRouter>{children}</MyAuthRouter>;
}
