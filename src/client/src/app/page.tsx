"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { setToken, clearToken } from "@/redux/slices/authSlice";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MyBasicAppShell } from "@/components/layouts/MyBasicAppShell/MyBasicAppShell";
import { menuData } from "@/data/userMenuData";

export default function HomePage({ children }: { children: React.ReactNode }) {
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();
  const Router = useRouter();

  const handleLogin = () => {
    const fakeToken = "abc123xyz456"; // Giả lập token
    dispatch(setToken(fakeToken)); // Lưu token vào Redux
  };

  const handleLogout = () => {
    dispatch(clearToken()); // Xóa token khỏi Redux
  };

  useEffect(() => {
    // if (token == null || token == "") {
    //   Router.push("auth/login");
    // }
  }, [token]);

  return <MyBasicAppShell menu={menuData}>{children}</MyBasicAppShell>;
}
