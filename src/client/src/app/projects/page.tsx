"use client";
import MyToolBar from "@/components/Toolbar/MyToolBar";
import { Flex, Grid } from "@mantine/core";
import CvContent from "./_components/CVContent";

export default function Page() {
  return (
    <Flex flex={1} direction="column" gap={16}>
      <MyToolBar />
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <CvContent />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Flex direction="column" gap={4} align="center">
            <img
              style={{ borderRadius: 8 }}
              src="https://resumesector.com/wp-content/uploads/2024/10/Pro-CV-Template-Free-Download-MS-Word.jpg"
              alt="CV"
            />
          </Flex>
        </Grid.Col>
      </Grid>
    </Flex>
  );
}
