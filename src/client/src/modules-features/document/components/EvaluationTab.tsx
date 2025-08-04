import evaluateService from "@/api/services/evaluateService";
import { IEvaluate } from "@/interface/evaluate";
import { ActionIcon, Badge, Button, Center, Group, Table, Text } from "@mantine/core";
import { IconAdjustments, IconRefresh } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";

interface EvaluationTabProps {
  id: string;
}

export default function EvaluationTab({ id }: EvaluationTabProps) {
  const query = useQuery<IEvaluate[]>({
    queryKey: ["EvaluationTab", id],
    queryFn: async () => {
      const response = await evaluateService.getEvaluations({ id });
      return response.data.data || [];
      //   return mockData;
    },
    enabled: false,
  });

  const handleEnableQuery = () => {
    query.refetch();
  };

  //   if (query.isLoading)
  //     return (
  //       <Center h="100vh" w="100%">
  //         Loading...
  //       </Center>
  //     );

  //   if (query.isError || !query.data)
  //     return (
  //       <Center h="100vh" w="100%">
  //         Không có dữ liệu...
  //       </Center>
  //     );

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">Đánh giá CV bởi AI</h3>
      {!query.data ? (
        <p className="text-gray-400 text-xs">💡 Nhấn nút tải đánh giá để thực hiện</p>
      ) : (
        <p className="text-gray-400 text-xs">💡 Nhấn nút tải lại để làm mới đánh giá</p>
      )}
      {!query.data && (
        <Button onClick={handleEnableQuery} size="xs" mt="8px">
          Tải đánh giá
        </Button>
      )}
      {query.isLoading && <Center w="100%">Loading...</Center>}
      {query.isError && <Center w="100%">Không có dữ liệu...</Center>}

      {query.isSuccess && (
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th w="22%" p={8}>
                <Text fz="13px" fw={500}>
                  Khu vực
                </Text>
              </Table.Th>
              <Table.Th w="18%" ta="center" p={8}>
                <Text fz="13px" fw={500}>
                  Điểm
                </Text>
              </Table.Th>
              <Table.Th p={8}>
                <Group justify="space-between" align="center">
                  <Text fz="13px" fw={500}>
                    Mô tả
                  </Text>
                  <ActionIcon
                    onClick={handleEnableQuery}
                    variant="light"
                    title="Tải lại"
                    aria-label="Settings"
                  >
                    <IconRefresh style={{ width: "70%", height: "70%" }} stroke={1.5} />
                  </ActionIcon>
                </Group>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {query.data.map((evaluation, index) => (
              <Table.Tr key={index}>
                <Table.Td p={4}>
                  <Text fz="13px">{evaluation.area}</Text>
                </Table.Td>
                <Table.Td ta="center" p={4}>
                  <Badge
                    color={
                      evaluation.score >= 8 ? "green" : evaluation.score >= 5 ? "orange" : "red"
                    }
                  >
                    {evaluation.score}
                  </Badge>
                </Table.Td>
                <Table.Td p={4}>
                  <Text fz="13px" color="dimmed" mb={evaluation.suggestion ? "2px" : 0}>
                    {evaluation.description}
                  </Text>
                  {evaluation.suggestion && (
                    <Text fz="13px" c="blue.5">
                      Gợi ý: {evaluation.suggestion}
                    </Text>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </div>
  );
}

const mockData: IEvaluate[] = [
  {
    area: "Thông tin",
    score: 9,
    description: "Thông tin liên hệ đầy đủ và rõ ràng.",
    suggestion: "Có thể thêm LinkedIn profile nếu có.",
    example: "LinkedIn: linkedin.com/in/yourprofile",
    correction: null,
  },
  {
    area: "Kinh nghiệm",
    score: 8,
    description:
      "Kinh nghiệm thực tập phù hợp với vị trí ứng tuyển. Mô tả công việc rõ ràng, sử dụng các động từ mạnh.",
    suggestion: "Nêu bật các thành tựu cụ thể, có số liệu càng tốt.",
    example: "Ví dụ: 'Tối ưu hóa hiệu suất của module X, giảm thời gian tải trang xuống 20%'.",
    correction: null,
  },
  {
    area: "Kĩ năng",
    score: 9,
    description:
      "Liệt kê đầy đủ các kỹ năng liên quan đến front-end và back-end. Phân loại rõ ràng.",
    suggestion:
      "Có thể chia nhỏ hơn thành các nhóm kỹ năng cụ thể (ví dụ: Frontend Frameworks, Backend Frameworks, Databases).",
    example: null,
    correction: null,
  },
  {
    area: "Học vấn",
    score: 8,
    description: "Thông tin học vấn đầy đủ. GPA khá tốt.",
    suggestion: "Có thể thêm các hoạt động ngoại khóa liên quan đến chuyên ngành.",
    example: "Ví dụ: 'Thành viên CLB Lập trình'.",
    correction: null,
  },
  {
    area: "Mục tiêu nghề nghiệp",
    score: 6,
    description: "Mục tiêu ngắn gọn nhưng chưa cụ thể.",
    suggestion:
      "Nêu rõ hơn về loại hình công ty mong muốn làm việc và định hướng phát triển trong tương lai gần.",
    example:
      "Ví dụ: 'Tìm kiếm vị trí full-stack developer tại một công ty công nghệ năng động, tập trung vào phát triển các ứng dụng web hiện đại, và mong muốn đóng góp vào các dự án có tác động lớn đến người dùng'.",
    correction: null,
  },
  {
    area: "Thành tích",
    score: 5,
    description: "Không có thông tin về thành tích.",
    suggestion:
      "Liệt kê các thành tích đạt được trong quá trình học tập hoặc làm việc, ví dụ: giải thưởng trong các cuộc thi, các dự án nổi bật, các đóng góp quan trọng cho công ty.",
    example:
      "Ví dụ: 'Đạt giải nhất cuộc thi lập trình ABC', 'Hoàn thành xuất sắc dự án XYZ, được khách hàng đánh giá cao'.",
    correction: null,
  },
  {
    area: "Dự án",
    score: 8,
    description:
      "Các dự án được mô tả khá chi tiết, liệt kê được công nghệ sử dụng và trách nhiệm.",
    suggestion: "Nên thêm các con số cụ thể để chứng minh kết quả đạt được từ dự án.",
    example: "Ví dụ: 'Tăng 15% lượng truy cập sau khi triển khai tính năng mới'.",
    correction: null,
  },
  {
    area: "Frontend",
    score: 9,
    description:
      "Kỹ năng frontend rất tốt, bao gồm HTML, CSS, JavaScript, TypeScript, ReactJS, Next.js, React-Native, Mantine UI, Shadcn UI, Tailwind CSS, Figma.",
    suggestion: "Không có.",
    example: null,
    correction: null,
  },
  {
    area: "Backend",
    score: 7,
    description:
      "Có kiến thức về backend với C#, .Net, NodeJS (ExpressJS), RESTful API. Hiểu về kiến trúc N-layer, Clean Architecture.",
    suggestion: "Có thể bổ sung thêm các kinh nghiệm làm việc cụ thể với backend.",
    example: null,
    correction: null,
  },
  {
    area: "Database",
    score: 7,
    description: "Có kinh nghiệm làm việc với SQL (SQL Server, MySQL) và NoSQL (MongoDB).",
    suggestion: "Có thể bổ sung kinh nghiệm về tối ưu hóa database.",
    example: null,
    correction: null,
  },
  {
    area: "Công cụ",
    score: 8,
    description: "Sử dụng thành thạo các công cụ Visual Studio, VS Code, GIT, Fork, Postman.",
    suggestion: "Không có.",
    example: null,
    correction: null,
  },
];
