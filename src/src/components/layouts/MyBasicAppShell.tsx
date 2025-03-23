"use client";
import {
  AppShell,
  Badge,
  Burger,
  Group,
  NavLink,
  Skeleton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Text } from "@mantine/core";
import { usePathname } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ReactNode, ComponentType } from "react";
// import { MantineLogo } from '@mantinex/mantine-logo';
export interface I0LinkItem {
  id?: number;
  englishLabel?: string;
  label: string;
  // status?: "Default" | "Prototype" | "New" | "Menu";
  link?: string;
  links?: I0LinkItem[];
  iconTabler?: string;
}

export function MyBasicAppShell({
  children,
  menu,
}: {
  children: React.ReactNode;
  menu: I0LinkItem[];
}) {
  const [opened, { toggle }] = useDisclosure();

  function getRightSection(status: string) {
    if (status === "Prototype")
      return (
        <Badge
          styles={{ root: { cursor: "pointer" } }}
          radius="xs"
          color="pink"
          circle
        >
          P
        </Badge>
      );
    if (status === "New")
      return (
        <Badge styles={{ root: { cursor: "pointer" } }} radius="xs" circle>
          N
        </Badge>
      );
    if (status === "Menu")
      return (
        <Badge
          styles={{ root: { cursor: "pointer" } }}
          radius="xs"
          color="gray"
          circle
        >
          M
        </Badge>
      );
    return null; // Fallback for unknown types
  }

  // Get dynamic icon from Tabler Icons
  function getLeftSection(iconName: string, size: number = 20) {
    if (!iconName) return null;

    try {
      const IconComponent = dynamic(
        async () => {
          const mod = await import("@tabler/icons-react");
          return (
            mod as unknown as Record<string, ComponentType<{ size?: number }>>
          )[iconName];
        },
        { ssr: false }
      );

      return <IconComponent size={size} />;
    } catch (error) {
      console.warn(`Icon "${iconName}" not found.`);
      return null;
    }
  }

  // Recursive function to render nested links
  function RenderNavLinks({ items }: { items: I0LinkItem[] }) {
    // const SidebarStore = useS_Sidebar()
    const pathName = usePathname();
    console.log("pathName", pathName.split("/")[1]);
    return (
      <>
        {items.map((item, index) => (
          <NavLink
            // active={item.link === pathName.split("/")[2]}
            active={item.link === pathName.split("/")[1]}
            component={Link}
            key={index}
            // rightSection={
            //     getRightSection(item.status!)
            // }

            leftSection={item.iconTabler && getLeftSection(item.iconTabler, 16)}
            // opened={SidebarStore.groupMenuOpenId.includes(item.label)}
            // href={`${item.link}` || "#"}
            // href={
            //   pathName.split("/")[0] +
            //   "/" +
            //   pathName.split("/")[1] +
            //   "/" +
            //   item.link
            // }
            href={pathName.split("/")[0] + "/" + item.link}
            label={item.label}
            childrenOffset={28}
            // rightSection={item.link && "prototype"}
            // onClick={() => {
            //     if (item.links) SidebarStore.toggleGroupMenuOpenId(item.label)
            //     if (item.link) {
            //         SidebarStore.setMenuCode(item.link)
            //         SidebarStore.setTitle(item.label)
            //     }
            // }}
          >
            {item.links && <RenderNavLinks items={item.links} />}
          </NavLink>
        ))}
      </>
    );
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          {/* <MantineLogo size={30} /> */}
          <Text fz={30}>iCV</Text>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <RenderNavLinks items={menu} />
        {/* {Array(15)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} h={28} mt="sm" animate={false} />
          ))} */}
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
