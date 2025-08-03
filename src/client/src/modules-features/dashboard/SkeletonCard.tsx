import { Box, Flex, Skeleton, Stack } from "@mantine/core";

interface SkeletonCardProp {
    isAnimation?: boolean;
}
export function SkeletonCard({ isAnimation }: SkeletonCardProp) {
  return (
    <Box
      style={{
        borderRadius: 12,
        overflow: "hidden",
        cursor: "pointer",
        height: 220,
        backgroundColor: "#F3F4F6",
      }}
    >
      <Skeleton animate={isAnimation} height={170} />
      <Box px={12} py={8}>
        <Stack gap={4}>
          <Skeleton animate={isAnimation} height={8} radius="xl" />
          <Flex justify="space-between" align="center">
            <Skeleton animate={isAnimation} height={6} width="60%" radius="xl" />
            <Skeleton animate={isAnimation} height={20} circle />
          </Flex>
        </Stack>
      </Box>
    </Box>
  );
}
