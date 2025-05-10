import {
  ActionIcon,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import cx from "clsx";
import classes from "./css.module.css";

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
      {/* <IconSun className={cx(classes.icon, classes.light)} stroke={1.5} />
            <IconMoon className={cx(classes.icon, classes.dark)} stroke={1.5} /> */}
    </ActionIcon>
  );
}
