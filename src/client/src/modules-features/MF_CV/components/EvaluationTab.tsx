import cvService from "@/api/services/cvService";
import { IEvaluate } from "@/interface/evaluate";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Center,
  Group,
  Loader,
  Table,
  Text,
  Textarea,
  useMantineColorScheme,
} from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

// Component để hiển thị rich text
const RichTextContent = ({
  content,
  className = "",
}: {
  content: string | null;
  className?: string;
}) => {
  if (!content) return null;

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Tùy chỉnh styling cho các thành phần Markdown
          p: ({ children }) => (
            <Text fz="13px" style={{ margin: "4px 0" }}>
              {children}
            </Text>
          ),
          strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
          ul: ({ children }) => <ul style={{}}>{children}</ul>,
          ol: ({ children }) => <ol style={{}}>{children}</ol>,
          li: ({ children }) => <li style={{ margin: "2px 0" }}>- {children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#228be6", textDecoration: "none" }}
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code
              style={{
                backgroundColor: "rgba(0,0,0,0.05)",
                padding: "2px 4px",
                borderRadius: "3px",
                fontSize: "12px",
              }}
            >
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

interface EvaluationTabProps {
  id: string;
}

export default function EvaluationTab({ id }: EvaluationTabProps) {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [jobDescription, setJobDescription] = useState("");

  const query = useQuery<IEvaluate[]>({
    queryKey: ["EvaluationTab", id, jobDescription],
    queryFn: async () => {
      if (jobDescription.trim()) {
        const response = await cvService.evaluateWithJobDescription(id, jobDescription.trim());
        return response.data.data || [];
      } else {
        const response = await cvService.getEvaluations(id);
        return response.data.data || [];
      }
      // return mockData;
    },
    enabled: false,
  });

  const handleEnableQuery = () => {
    query.refetch();
  };

  return (
    <Box>
      <Text mb={1} fz={"sm"} fw={500}>
        Đánh giá CV bởi AI
      </Text>
      {!query.data ? (
         <Text size="xs" c="gray.6" mb={10}>Nhấn nút tải đánh giá để thực hiện</Text>
      ) : (
        <Text className="text-gray-400 text-xs">Nhấn nút tải lại để làm mới đánh giá</Text>
      )}
      <Textarea
        placeholder="Nhập mô tả công việc (Job Description) để đánh giá CV phù hợp với vị trí cụ thể... Để trống nếu muốn đánh giá tổng quát CV."
        minRows={3}
        maxRows={6}
        autosize
        value={jobDescription}
        onChange={(event) => setJobDescription(event.currentTarget.value)}
        mb="sm"
        size="xs"
      />

      {!query.data && (
        <Button onClick={handleEnableQuery} size="xs" >
          {query.isLoading ? <Loader color="white" size={16} /> : "Tải đánh giá"}
        </Button>
      )}
      {query.isError && <Center w="100%">Không có dữ liệu...</Center>}

      {query.isSuccess && (
        <Table.ScrollContainer
          minWidth={50}
          maxHeight={"Calc(100vh - 190px)"}
          style={{
            padding: "4px 8px",
            borderRadius: "8px",
            marginTop: "8px",
            border: colorScheme === "dark" ? "none" : "1px solid #ddd",
          }}
        >
          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th w="22%" p={4}>
                  <Text fz="13px" fw={500}>
                    Khu vực
                  </Text>
                </Table.Th>
                <Table.Th w="18%" ta="center" p={4}>
                  <Text fz="13px" fw={500}>
                    Điểm
                  </Text>
                </Table.Th>
                <Table.Th p={4}>
                  <Group justify="space-between" align="center">
                    <Text fz="13px" fw={500}>
                      Mô tả
                    </Text>
                    <ActionIcon
                      onClick={handleEnableQuery}
                      variant="light"
                      title="Tải lại"
                      aria-label="Settings"
                      loading={query.isRefetching}
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
                  <Table.Td p={6}>
                    <Text c={colorScheme === "dark" ? "gray.4" : "gray.7"} fz="13px">
                      {evaluation.area}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="center" p={6}>
                    <Badge
                      color={
                        evaluation.score >= 8 ? "green" : evaluation.score >= 5 ? "orange" : "red"
                      }
                    >
                      {evaluation.score}
                    </Badge>
                  </Table.Td>
                  <Table.Td p={6}>
                    
                    <Text fz="13px" c={colorScheme === "dark" ? "gray.4" : "gray.7"}>
                      {evaluation.description}
                    </Text>

                    {/* Suggestion */}
                    {evaluation.suggestion && (
                      <Box
                        bg={colorScheme === "dark" ? "rgba(203, 237, 255, 0.1)" : "#E8F3FC"}
                        className="p-2 rounded-md mt-2"
                      >
                        <Text fz="13px" c="blue.5" fw={600} mb={4}>
                          Gợi ý:
                        </Text>
                        <RichTextContent
                          content={evaluation.suggestion}
                          className="suggestion-content"
                        />
                      </Box>
                    )}

                    {/* Example */}
                    {evaluation.example && (
                      <Box
                        bg={
                          colorScheme === "dark"
                            ? "rgba(255, 247, 237, 0.1)"
                            : "rgba(255, 247, 237, 1)"
                        }
                        className="p-2 rounded-md mt-2"
                      >
                        <Text fz="13px" c="orange.5" fw={600} mb={4}>
                          Ví dụ:
                        </Text>
                        <RichTextContent content={evaluation.example} className="example-content" />
                      </Box>
                    )}

                    {/* Correction */}
                    {evaluation.correction && (
                      <Box
                        bg={
                          colorScheme === "dark"
                            ? "rgba(254, 242, 242, 0.1)"
                            : "rgba(254, 242, 242, 1)"
                        }
                        className="p-2 rounded-md mt-2"
                      >
                        <Text fz="13px" c="red.5" fw={600} mb={4}>
                          Điều chỉnh:
                        </Text>
                        <RichTextContent
                          content={evaluation.correction}
                          className="correction-content"
                        />
                      </Box>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </Box>
  );
}

const mockData: IEvaluate[] = [
  {
    area: "Thông tin",
    score: 10,
    description:
      "Thông tin đầy đủ và rõ ràng: Họ tên, vị trí ứng tuyển, địa chỉ, email, số điện thoại.",
    suggestion: null,
    example: null,
    correction: null,
  },
  {
    area: "Giới thiệu",
    score: 8,
    description: "Mục tiêu nghề nghiệp và khả năng được nêu ngắn gọn.",
    suggestion:
      "Nên cụ thể hóa mục tiêu hơn (ví dụ: 'Trở thành full-stack developer chuyên về React và Node.js, đóng góp vào các dự án...', thay vì chỉ 'trở thành một full-stack developer'). Thêm một vài dòng về điểm mạnh hoặc kinh nghiệm nổi bật để thu hút sự chú ý.",
    example:
      "Mục tiêu: Trở thành full-stack developer chuyên về React và Node.js, đóng góp vào các dự án phát triển các ứng dụng web hiệu suất cao. Có kinh nghiệm làm việc với Next.js và TypeScript, khả năng học hỏi nhanh và tinh thần làm việc nhóm tốt.",
    correction: null,
  },
  {
    area: "Kinh nghiệm",
    score: 9,
    description: "Mô tả chi tiết công việc, công nghệ sử dụng và đóng góp trong dự án.",
    suggestion:
      "Nên định lượng hóa các thành tựu nếu có thể (ví dụ: 'Tăng tốc độ tải trang web lên X%', 'Giảm số lượng bug phát sinh sau release Y%').",
    example:
      "Phát triển các module web cho các dự án được giao, giúp tăng tốc độ tải trang web lên 15%.",
    correction: null,
  },
  {
    area: "Kĩ năng",
    score: 10,
    description: "Liệt kê đầy đủ các kỹ năng liên quan đến vị trí ứng tuyển.",
    suggestion: null,
    example: null,
    correction: null,
  },
  {
    area: "Học vấn",
    score: 8,
    description: "Thông tin về trường học và chuyên ngành.",
    suggestion:
      "Có thể thêm thời gian học để rõ ràng hơn. Nếu có GPA cao hoặc thành tích học tập nổi bật, nên đề cập.",
    example: "Trường Đại học Trà Vinh (2021-2025), Chuyên ngành: Công nghệ thông tin, GPA: 3.5/4.0",
    correction: null,
  },
  {
    area: "Dự án",
    score: 9,
    description: "Mô tả chi tiết dự án, vai trò, trách nhiệm và công nghệ sử dụng.",
    suggestion:
      "Nên làm rõ hơn về kết quả của dự án (ví dụ: số lượng người dùng, doanh thu, v.v.).",
    example: "Dự án thu hút 1000 người dùng trong tháng đầu tiên ra mắt.",
    correction: null,
  },
  {
    area: "Thành tích",
    score: 0,
    description: "Không có thông tin về thành tích.",
    suggestion:
      "Liệt kê các thành tích đạt được trong quá trình học tập và làm việc (ví dụ: giải thưởng, học bổng, thành tích trong các cuộc thi, v.v.).",
    example: "Đạt giải nhất cuộc thi lập trình ABC.",
    correction: null,
  },
  {
    area: "Chứng chỉ",
    score: 0,
    description: "Không có thông tin về chứng chỉ.",
    suggestion:
      "Liệt kê các chứng chỉ liên quan đến chuyên môn (ví dụ: chứng chỉ lập trình, chứng chỉ tiếng Anh, v.v.).",
    example: "Chứng chỉ IELTS 7.0.",
    correction: null,
  },
  {
    area: "Giải thưởng",
    score: 0,
    description: "Không có thông tin về giải thưởng.",
    suggestion:
      "Liệt kê các giải thưởng đã đạt được (ví dụ: giải thưởng trong các cuộc thi, giải thưởng của công ty, v.v.).",
    example: "Nhân viên xuất sắc quý 3 năm 2023.",
    correction: null,
  },
];
