"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { setToken, clearToken } from "@/redux/slices/authSlice";
import { useEffect } from "react";
import { useRouter } from "next/navigation";


export default function HomePage() {
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
    if (token == null || token == "") {
      Router.push("auth/login");
    }
  }, [token]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <h1 className="text-3xl font-bold">
        {token ? `Token: ${token}` : "Chưa đăng nhập"}
      </h1>
      <div className="space-x-2">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={handleLogin}
        >
          Đăng nhập
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded"
          onClick={handleLogout}
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
