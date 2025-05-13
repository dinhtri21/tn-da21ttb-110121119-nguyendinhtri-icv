import {
  Box,
  Center,
  Flex,
  Text,
  Image,
  Grid,
  Divider,
  Group,
  List,
  Card,
  Paper,
  em,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
//  width: "212mm", // Width of A4 in mm
//  height: "299.4mm", // Height of A4 in mm
import {
  IconAlignBoxLeftStretch,
  IconBriefcase,
  IconBook2,
  IconDeviceDesktopPause,
  IconSchool,
} from "@tabler/icons-react";
export default function IConicTemplate() {
  const isMobile = useMediaQuery(`(max-width: ${"576px"})`);
  const isTablet = useMediaQuery(
    `(min-width: ${"576px"}) and (max-width: ${"768px"})`
  );
  return (
    <>
      <Paper
        shadow="xl"
        withBorder
        w={{ base: "343px", xs: "500px", sm: "620px", md: "620px" }}
        p="1px"
        mx="auto"
        h={{ base: "484px", xs: "706px", sm: "875px", md: "875px" }}
      >
        <Flex
          id="print-section"
          style={{
            transform: `scale(${isMobile ? 0.425 : isTablet ? 0.621 : 0.77})`,
            transformOrigin: "top left",
          }}
          h="1131.0136220472px"
          w="800.3149605292px"
        >
          <Flex direction="column" px={30} pt={30}>
            {/* Thông tin */}
            <Flex direction="row" justify="center">
              <Flex direction="column">
                <Text fz="35px">Nguyễn Văn A</Text>
                <Text size="md">Fullstack developer</Text>
                <Grid mt={20}>
                  <Grid.Col span={6} py={0}>
                    <Flex direction="row" gap={10}>
                      <Text fw={600} size="md">
                        Tên
                      </Text>
                      <Text size="md">Nguyễn Văn A</Text>
                    </Flex>
                  </Grid.Col>
                  <Grid.Col span={6} py={0}>
                    <Flex direction="row" gap={10}>
                      <Text fw={600} size="md">
                        Ngày sinh
                      </Text>
                      <Text size="md">1/1/2000</Text>
                    </Flex>
                  </Grid.Col>
                  <Grid.Col span={6} py={0}>
                    <Flex direction="row" gap={10}>
                      <Text fw={600} size="md">
                        Số điện thoại
                      </Text>
                      <Text size="md">0357558291</Text>
                    </Flex>
                  </Grid.Col>
                  <Grid.Col span={6} py={0}>
                    <Flex direction="row" gap={10}>
                      <Text fw={600} size="md">
                        Email
                      </Text>
                      <Text size="md">nguyenvana@gmail.com</Text>
                    </Flex>
                  </Grid.Col>
                  <Grid.Col span={6} py={0}>
                    <Flex direction="row" gap={10}>
                      <Text fw={600} size="md">
                        Địa chỉ
                      </Text>
                      <Text size="md">Càng Long, Trà Vinh</Text>
                    </Flex>
                  </Grid.Col>
                </Grid>
              </Flex>
              <Image
                radius="md"
                h={180}
                w={180}
                src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-10.png"
              />
            </Flex>
            {/* Tổng quan */}
            <Flex direction="column" justify="center" mt={10}>
              <Group gap={6}>
                <IconAlignBoxLeftStretch stroke={1} size={20} />
                <Text fw={500} fz="22px">
                  Tổng quan
                </Text>
              </Group>
              <Divider my="4px" size="sm" />
              <Text size="md">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                tincidunt, nunc at bibendum facilisis, nunc nisl aliquet nunc,
                eget aliquam nisl nunc eget lorem. Sed tincidunt, nunc at
                bibendum facilisis, nunc nisl aliquet nunc, eget aliquam nisl
                nunc eget lorem.
              </Text>
            </Flex>
            {/* Kinh nghiệm */}
            <Flex direction="column" justify="center" mt={15}>
              <Group gap={6}>
                <IconBriefcase stroke={1} size={20} />
                <Text fw={500} fz="22px">
                  Kinh nghiệm
                </Text>
              </Group>
              <Divider my="4px" size="sm" />
              <Grid mt={8} pl={6}>
                <Grid.Col span={4} py={0}>
                  07/2015 - 03/2018
                </Grid.Col>
                <Grid.Col span={8} py={0}>
                  <Text size="md" fw={600}>
                    FREELANCER
                  </Text>
                  <Text size="md" fs="italic">
                    Full-stack Developer
                  </Text>
                  <Text size="md">{`Programme outsourcing projects
Create coding frames and design database based on project descriptions`}</Text>
                </Grid.Col>
                <Grid.Col span={4} py={0} mt={6}>
                  07/2015 - Hiện tại
                </Grid.Col>
                <Grid.Col span={8} py={0} mt={6}>
                  <Text size="md" fw={600}>
                    FREELANCER
                  </Text>
                  <Text size="md" fs="italic">
                    Full-stack Developer
                  </Text>
                  <Text size="md">{`Programme outsourcing projects
Create coding frames and design database based on project descriptions`}</Text>
                </Grid.Col>
              </Grid>
            </Flex>
            {/* Học vấn */}
            <Flex direction="column" justify="center" mt={15}>
              <Group gap={6}>
                <IconSchool stroke={1} size={20} />
                <Text fw={500} fz="22px">
                  Học vấn
                </Text>
              </Group>
              <Divider my="4px" size="sm" />
              <Grid mt={8} pl={6}>
                <Grid.Col span={4} py={0}>
                  07/2015 - 03/2025
                </Grid.Col>
                <Grid.Col span={8} py={0}>
                  <Text size="md" fw={600}>
                    Đại học Trà Vinh
                  </Text>
                  <Text size="md">Chuyên ngành: Công nghệ thông tin</Text>
                  <Text size="md">Xếp loại: Khá</Text>
                </Grid.Col>
              </Grid>
            </Flex>
            {/* Dự án */}
            <Flex direction="column" justify="center" mt={15}>
              <Group gap={6}>
                <IconDeviceDesktopPause stroke={1} size={20} />
                <Text fw={500} fz="22px">
                  Kỹ năng
                </Text>
              </Group>
              <Divider my="4px" size="sm" />
              <Grid mt={8} pl={6}>
                <Grid.Col span={4} py={0}>
                  Kỹ năng chính
                </Grid.Col>
                <Grid.Col span={8} py={0}>
                  <List listStyleType="disc">
                    <List.Item>
                      HTML, CSS, JavaScript (ReactJS, React-Native, Lit)
                    </List.Item>
                    <List.Item>Node (ExpressJS)</List.Item>
                    <List.Item>MySQL, PostgreSQL, NoSQL (MongoDB)</List.Item>
                  </List>
                </Grid.Col>
                <Grid.Col span={4} py={0}>
                  Kỹ năng khác
                </Grid.Col>
                <Grid.Col span={8} py={0}>
                  <List listStyleType="disc">
                    <List.Item>Git, Postman, Figma</List.Item>
                    <List.Item>Trello, Jira, Slack</List.Item>
                  </List>
                </Grid.Col>
              </Grid>
            </Flex>
            <Flex direction="column" justify="center" mt={15}>
              <Group gap={6}>
                <IconBook2 stroke={1} size={20} />
                <Text fw={500} fz="22px">
                  Dự án
                </Text>
              </Group>
              <Divider my="4px" size="sm" />
              <Grid mt={8} pl={6}>
                <Grid.Col span={4} py={0}>
                  07/2015 - 03/2018
                </Grid.Col>
                <Grid.Col span={8} py={0}>
                  <Text size="md" fw={600}>
                    UniHand
                  </Text>
                  <Text size="md" fs="italic">
                    Using a Low-Code platform, connecting communities, providing
                    quick information, managing humanitarian aid.
                  </Text>
                  <Text size="md">Vị trí: Developer</Text>
                  <Text size="md">{`Programme outsourcing projects
Create coding frames and design database based on project descriptions`}</Text>
                </Grid.Col>
              </Grid>
            </Flex>
          </Flex>
        </Flex>
      </Paper>
    </>
  );
}
