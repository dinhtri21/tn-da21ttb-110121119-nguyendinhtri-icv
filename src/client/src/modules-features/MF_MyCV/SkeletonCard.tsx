import {
  Box,
  Center,
  Flex,
  Text,
  useMantineColorScheme
} from "@mantine/core";

interface SkeletonCardProp {
  isLoading?: boolean;
}

// Custom Skeleton component
const CustomSkeleton = ({ 
  height, 
  width, 
  circle = false, 
  className = "" 
}: { 
  height: number | string, 
  width: number | string, 
  circle?: boolean, 
  className?: string 
}) => {
  return (
    <div 
      className={`skeleton-pulse ${className}`} 
      style={{ 
        height: typeof height === 'number' ? `${height}px` : height, 
        width: typeof width === 'number' ? `${width}px` : width, 
        borderRadius: circle ? '50%' : '4px'
      }} 
    />
  );
};

export function SkeletonCard({ isLoading = false }: SkeletonCardProp) {
  const { colorScheme } = useMantineColorScheme();
  
  return (
    <div
      className="border border-gray-200 dark:border-gray-300"
      style={{
        borderRadius: 12,
        overflow: "hidden",
        cursor: isLoading ? "default" : "pointer",
        height: 220,
      }}
    >
      <Center h={170} >
        
      </Center>
      <Box px={12} py={4} className="border-t border-gray-200">
        
        
        <Flex justify="space-between" align="center" mt={4}>
          {isLoading ? (
            <>
              <CustomSkeleton height={14} width="40%" />
              <CustomSkeleton height={16} width={16} circle={true} />
            </>
          ) : (
            <>
              <Text size="xs" c={colorScheme === "dark" ? "gray.4" : "gray.8"} lineClamp={1}>
              </Text>
              <Box>
               
              </Box>
            </>
          )}
        </Flex>
      </Box>

      <style jsx global>{`
        .skeleton-pulse {
          background: ${colorScheme === "dark" ? "#2C2E33" : "#E9ECEF"};
          background-image: linear-gradient(
            90deg,
            ${colorScheme === "dark" ? "#2C2E33" : "#E9ECEF"},
            ${colorScheme === "dark" ? "#444" : "#F1F3F5"},
            ${colorScheme === "dark" ? "#2C2E33" : "#E9ECEF"}
          );
          background-size: 200px 100%;
          background-repeat: no-repeat;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }
        
        @keyframes skeleton-pulse {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }
      `}</style>
    </div>
  );
}
