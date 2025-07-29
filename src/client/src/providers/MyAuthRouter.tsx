"use client";

import { IUser } from "@/interface/user";
import { setToken } from "@/redux/slices/authSlice";
import { setUser } from "@/redux/slices/userSlide";
import { RootState } from "@/redux/store";
import { Box, LoadingOverlay } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function MyAuthRouter({ children }: { children: React.ReactNode }) {
  let tokenLocalStorage: string | null = null;
  let userDataLocalStorage: IUser | null = null;
  if (typeof window !== "undefined") {
    tokenLocalStorage = localStorage.getItem("authToken");
    const userDataString = localStorage.getItem("userData");
    userDataLocalStorage = userDataString ? JSON.parse(userDataString) : null;
  }
  const pathname = usePathname();
  const isAuthPage = pathname.includes("/auth");

  const [checkAuth, setCheckAuth] = useState(true);
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();
  const Router = useRouter();

  useEffect(() => {
    // No token local app
    if (token == null || token == "") {
      // No token LocalStorage
      if (tokenLocalStorage == null || tokenLocalStorage == "") {
        Router.replace("/auth/login");
        return;
        // No userData LocalStorage
      } else if (userDataLocalStorage == null) {
        // fetch Data User
      } else {
        dispatch(setToken(tokenLocalStorage));
        dispatch(setUser(userDataLocalStorage));
        setCheckAuth(false);
        if (isAuthPage) {
          Router.replace("/dashboard");
        }
      }
    }

    // No userData local app
    // => fetch Data User

    // Have token local app
    setCheckAuth(false);
    if (isAuthPage) {
      Router.replace("/dashboard");
    }
  }, [token]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (checkAuth) {
    return (
      <Box
        style={{
          width: "100vw",
          height: "100vh",
        }}
        pos="relative"
      >
        <LoadingOverlay
          visible={checkAuth}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
          loaderProps={{ color: "blue", type: "bars" }}
        />
      </Box>
    );
  }

  return <>{children}</>;
}
