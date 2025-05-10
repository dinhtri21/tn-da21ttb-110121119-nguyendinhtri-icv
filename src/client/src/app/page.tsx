"use client";

import { MyBasicAppShell } from "@/components/layouts/MyBasicAppShell/MyBasicAppShell";
import { clearToken, setToken } from "@/redux/slices/authSlice";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

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

  return <MyBasicAppShell>{children}</MyBasicAppShell>;
}
