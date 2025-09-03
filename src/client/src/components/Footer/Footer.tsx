"use client";

import {
  Container,
  Group,
  Text,
  Stack,
  SimpleGrid,
  Anchor,
  Badge,
  Flex,
  Box,
  useComputedColorScheme,
} from "@mantine/core";
import {
  IconMail,
  IconPhone,
  IconMapPin,
  IconBrandChrome,
  IconBrandApple,
  IconBrandAndroid,
} from "@tabler/icons-react";

export default function Footer() {
  const computedColorScheme = useComputedColorScheme("light", { getInitialValueInEffect: true });
  const isDark = computedColorScheme === "dark";

  const services = [
    { label: "CV Scoring (ATS)", href: "#" },
    { label: "Job Matching Score", href: "#" },
    // { label: "Cover Letter Generator", href: "#" },
    // { label: "Salary Estimator", href: "#" },
    { label: "AI Resume Builder", href: "#" },
    // { label: "Interview Coach", href: "#", badge: "Soon" },
    { label: "AI Career Coach", href: "#", badge: "Soon" },
  ];

  const resources = [
    { label: "About Us", href: "#" },
    // { label: "Delivery and Return Conditions", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "FAQ", href: "#" },
    { label: "PRICING", href: "#" },
  ];

  const apps = [
    { label: "Chrome Extension", href: "#", icon: IconBrandChrome },
    { label: "iOS App", href: "#", icon: IconBrandApple, badge: "Soon" },
    { label: "Android App", href: "#", icon: IconBrandAndroid, badge: "Soon" },
  ];

  const footerLinks = [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ];

  return (
    <footer
      className={`border-t ${
        isDark ? "border-slate-600 text-gray-200" : "border-slate-300 text-gray-800"
      }`}
    >
      <Container size="80rem" className="py-12">
        {/* Main Footer Content */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="xl">
          {/* Company Info */}
          <Stack gap="md">
            <Group gap="xs" className="items-center">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <Text size="lg" fw={700} c="dark">
                  iCV
                </Text>
              </div>
              <Text size="xl" fw={600} c="white"></Text>
            </Group>
            <Text
              size="sm"
              className={`leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"}`}
            >
              Hỗ trợ các chuyên gia tối ưu hóa hồ sơ ứng tuyển và chinh phục công việc mơ ước từ năm
              2025.
            </Text>
            <Text
              size="sm"
              className={`leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              © 2025 icv.codes. All rights reserved.
            </Text>
          </Stack>

          {/* Resources */}
          <Stack gap="md" pl={40}>
            <Text
              size="lg"
              fw={600}
              className={`${isDark ? "text-purple-300" : "text-purple-600"}`}
            >
              Tài nguyên
            </Text>
            <Stack gap="xs">
              {resources.map((resource, index) => (
                <Text
                  key={index}
                  size="sm"
                  className={`transition-colors ${
                    isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {resource.label}
                </Text>
              ))}
            </Stack>
          </Stack>

          {/* Services */}
          <Stack gap="md">
            <Text size="lg" fw={600} className={`${isDark ? "text-blue-300" : "text-blue-600"}`}>
              Dịch vụ
            </Text>
            <Stack gap="xs">
              {services.map((service, index) => (
                <Flex key={index} align="center" gap="xs">
                  <Text
                    size="sm"
                    className={`transition-colors ${
                      isDark
                        ? "text-gray-300 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {service.label}
                  </Text>
                  {service.badge && (
                    <Badge size="xs" variant="light" color="blue">
                      {service.badge}
                    </Badge>
                  )}
                </Flex>
              ))}
            </Stack>
          </Stack>

          {/* Contact & Apps */}
          <Stack gap="md">
            <Text
              size="lg"
              fw={600}
              className={`mb-3 ${isDark ? "text-yellow-300" : "text-yellow-600"}`}
            >
              Liên hệ
            </Text>
            <Stack gap="xs">
              <Flex align="center" gap="xs">
                <IconMail size={16} className={`${isDark ? "text-gray-400" : "text-gray-500"}`} />
                <Text
                  size="sm"
                  className={`transition-colors ${
                    isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  tringuyen.21092003@gmail.com
                </Text>
              </Flex>
              <Flex align="center" gap="xs">
                <IconPhone size={16} className={`${isDark ? "text-gray-400" : "text-gray-500"}`} />
                <Text size="sm" className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  +03 5755 0218
                </Text>
              </Flex>
              <Flex align="start" gap="xs">
                <IconMapPin
                  size={16}
                  className={`mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                />
                <Stack gap="0">
                  <Text size="sm" className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    126 Nguyễn Thiện Thành
                  </Text>
                  <Text size="sm" className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    Phường 5,
                  </Text>
                  <Text size="sm" className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    Trà Vinh
                  </Text>
                </Stack>
              </Flex>
            </Stack>
          </Stack>
        </SimpleGrid>
      </Container>

      {/* Bottom Footer */}
      {/* <div className="border-t border-slate-700">
        <Container size="80rem" className="py-6">
          <Flex
            justify="space-between"
            align="center"
            direction={{ base: "column", sm: "row" }}
            gap="md"
          >
            <Stack gap="xs" align={{ base: "center", sm: "flex-start" }}>
              <Text size="sm" className="text-gray-400">
                © 2025 CVScoring.com. All rights reserved.
              </Text>
              <Flex align="center" gap="xs">
                <Text size="sm" className="text-gray-400">
                  Made with
                </Text>
                <Text size="sm" className="text-red-500">
                  ❤️
                </Text>
                <Text size="sm" className="text-gray-400">
                  by Arfitect
                </Text>
              </Flex>
            </Stack>

            <Group gap="md">
              {footerLinks.map((link, index) => (
                <Anchor
                  key={index}
                  href={link.href}
                  size="sm"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Anchor>
              ))}
            </Group>
          </Flex>
        </Container>
      </div> */}
    </footer>
  );
}
