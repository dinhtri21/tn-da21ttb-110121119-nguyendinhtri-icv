import {
  ActionIcon,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

export function MySwitchTheme() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  return (
    <ActionIcon
      onClick={() =>
        setColorScheme(computedColorScheme === "light" ? "dark" : "light")
      }
      variant="default"
      size="lg"
      radius={"md"}
      aria-label="Toggle color scheme"
    >
      <IconSun
        stroke={1.5}
        style={{ display: computedColorScheme === "light" ? "block" : "none" }}
      />
      <IconMoon
        stroke={1.5}
        style={{ display: computedColorScheme === "dark" ? "block" : "none" }}
      />
    </ActionIcon>
  );
}
