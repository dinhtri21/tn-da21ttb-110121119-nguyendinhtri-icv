"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Center, Text, Loader, Alert } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";

export default function GoogleCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [message, setMessage] = useState("Đang xử lý xác thực Google...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Lấy parameters từ URL
        const params = new URLSearchParams(window.location.search);
        const success = params.get("success");
        const token = params.get("token");
        const userParam = params.get("user");
        const error = params.get("error");

        if (error) {
          setStatus("error");
          setMessage(getErrorMessage(error));
          
          // Gửi error về parent window
          if (window.opener) {
            window.opener.postMessage({ error }, window.location.origin);
          }
          
          // Đóng popup sau 3 giây
          setTimeout(() => {
            if (window.opener) {
              window.close();
            } else {
              router.replace("/auth/login");
            }
          }, 3000);
          return;
        }

        if (success === "true" && token && userParam) {
          try {
            const user = JSON.parse(decodeURIComponent(userParam));
            
            setStatus("success");
            setMessage(`Đăng nhập thành công! Chào mừng ${user.name}`);
            
            // Gửi dữ liệu về parent window
            if (window.opener) {
              window.opener.postMessage({ 
                success: true, 
                token, 
                user 
              }, window.location.origin);
              
              // Đóng popup sau 2 giây
              setTimeout(() => window.close(), 2000);
            } else {
              // Nếu không có parent window, lưu dữ liệu và redirect
              localStorage.setItem("authToken", token);
              localStorage.setItem("userData", JSON.stringify(user));
              setTimeout(() => router.replace("/dashboard"), 2000);
            }
          } catch (parseError) {
            console.error("Error parsing user data:", parseError);
            setStatus("error");
            setMessage("Dữ liệu người dùng không hợp lệ");
            
            if (window.opener) {
              window.opener.postMessage({ error: "invalid_user_data" }, window.location.origin);
            }
            
            setTimeout(() => {
              if (window.opener) {
                window.close();
              } else {
                router.replace("/auth/login");
              }
            }, 3000);
          }
        } else {
          setStatus("error");
          setMessage("Thiếu thông tin xác thực");
          
          setTimeout(() => {
            if (window.opener) {
              window.close();
            } else {
              router.replace("/auth/login");
            }
          }, 3000);
        }
      } catch (error) {
        console.error("Callback error:", error);
        setStatus("error");
        setMessage("Có lỗi xảy ra trong quá trình xác thực");
        
        if (window.opener) {
          window.opener.postMessage({ error: "callback_failed" }, window.location.origin);
        }
        
        setTimeout(() => {
          if (window.opener) {
            window.close();
          } else {
            router.replace("/auth/login");
          }
        }, 3000);
      }
    };

    handleCallback();
  }, [router]);

  const getErrorMessage = (error: string) => {
    const errorMessages = {
      invalid_state: "Phiên đăng nhập không hợp lệ",
      session_expired: "Phiên đăng nhập đã hết hạn",
      missing_code: "Thiếu mã xác thực",
      token_exchange_failed: "Không thể trao đổi token với Google",
      user_info_failed: "Không thể lấy thông tin người dùng từ Google",
      authentication_failed: "Xác thực thất bại",
      access_denied: "Bạn đã từ chối truy cập",
      invalid_user_data: "Dữ liệu người dùng không hợp lệ",
      callback_failed: "Quá trình callback thất bại",
    };
    return errorMessages[error as keyof typeof errorMessages] || `Có lỗi xảy ra: ${error}`;
  };

  return (
    <Center h="100vh" w="100vw" p="xl">
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        {status === "processing" && (
          <>
            <Loader size="xl" mb="lg" />
            <Text size="lg" mb="md">{message}</Text>
            <Text size="sm" c="dimmed">
              Vui lòng chờ trong giây lát...
            </Text>
          </>
        )}
        
        {status === "success" && (
          <>
            <Alert
              icon={<IconCheck size={16} />}
              title="Thành công!"
              color="green"
              mb="lg"
            >
              {message}
            </Alert>
            <Text size="sm" c="dimmed">
              Cửa sổ sẽ tự động đóng...
            </Text>
          </>
        )}
        
        {status === "error" && (
          <>
            <Alert
              icon={<IconX size={16} />}
              title="Lỗi xác thực"
              color="red"
              mb="lg"
            >
              {message}
            </Alert>
            <Text size="sm" c="dimmed">
              Cửa sổ sẽ tự động đóng hoặc chuyển hướng...
            </Text>
          </>
        )}
      </div>
    </Center>
  );
}