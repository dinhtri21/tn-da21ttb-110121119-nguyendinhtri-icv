'use client'
import { MyBasicAppShell } from "@/components/layouts/MyBasicAppShell";
import { ReactNode } from "react";
import { menuData } from "@/data/userMenuData";

export default function Layout({ children }: { children?: ReactNode }) {
    return <MyBasicAppShell menu={menuData}>{children}</MyBasicAppShell>;
}