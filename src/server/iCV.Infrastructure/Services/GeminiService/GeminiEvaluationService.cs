using iCV.Application.Common.DTOs;
using iCV.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace iCV.Infrastructure.Services.GeminiService
{
    public class GeminiEvaluationService : IGeminiEvaluationService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public GeminiEvaluationService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _apiKey = config["Gemini:ApiKey"];
        }

        public async Task<string> NormalizeCVAsync(CVDto cv)
        {
            try
            {
                string prompt = GenerateNormalizePrompt(cv);

                var requestBody = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[]
                            {
                                new { text = prompt }
                            }
                        }
                    }
                };

                string json = JsonSerializer.Serialize(requestBody);
                var request = new HttpRequestMessage(HttpMethod.Post, $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={_apiKey}")
                {
                    Content = new StringContent(json, Encoding.UTF8, "application/json")
                };

                var response = await _httpClient.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var jsonResponse = await response.Content.ReadAsStringAsync();

                // Kiểm tra response rỗng
                if (string.IsNullOrWhiteSpace(jsonResponse))
                    return string.Empty;

                using var doc = JsonDocument.Parse(jsonResponse);
                var text = doc.RootElement
                              .GetProperty("candidates")[0]
                              .GetProperty("content")
                              .GetProperty("parts")[0]
                              .GetProperty("text")
                              .GetString();

                if (string.IsNullOrWhiteSpace(text))
                    return string.Empty;

                // Làm sạch JSON response trước khi trả về
                text = CleanJsonResponse(text);

                // Trả về JSON string thô từ Gemini
                return text;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"NormalizeCVAsync error: {ex.Message}");
                return string.Empty;
            }
        }

        private string GenerateNormalizePrompt(CVDto cv)
        {
            var sb = new StringBuilder();
            sb.AppendLine("Bạn là AI, hãy chuẩn hóa dữ liệu CV dưới đây thành JSON với các trường: FullName, JobTitle, Address, Email, Phone, Overview, Experiences (list), Projects (list), Educations (list), Skills (list), Awards (list), Certificates (list), CareerObjective, Achievements (list).");
            sb.AppendLine("Loại bỏ HTML, gom thông tin rải rác, tách các trường nếu nằm trong description.");
            sb.AppendLine("Chỉ trả về JSON thuần túy, không giải thích, không markdown, không bọc trong dấu `.");
            sb.AppendLine("CV:");
            sb.AppendLine($"Họ tên: {cv.PersonalInfo?.FullName}");
            sb.AppendLine($"Vị trí ứng tuyển: {cv.PersonalInfo?.JobTitle}");
            sb.AppendLine($"Địa chỉ: {cv.PersonalInfo?.Address}");
            sb.AppendLine($"Email: {cv.PersonalInfo?.Email}");
            sb.AppendLine($"Số điện thoại: {cv.PersonalInfo?.Phone}");
            sb.AppendLine($"Tóm tắt: {cv.PersonalInfo?.Overview}");

            if (cv.Experiences != null)
            {
                sb.AppendLine("Kinh nghiệm:");
                foreach (var exp in cv.Experiences)
                    sb.AppendLine($"- {exp.Title}: {StripHtml(exp.Description)}");
            }

            if (cv.Projects != null)
            {
                sb.AppendLine("Dự án:");
                foreach (var proj in cv.Projects)
                    sb.AppendLine($"- {proj.Title}: {StripHtml(proj.Description)}");
            }

            if (cv.Education != null)
            {
                sb.AppendLine("Học vấn:");
                foreach (var edu in cv.Education)
                    sb.AppendLine($"- {edu.UniversityName}: {StripHtml(edu.Description)}");
            }

            sb.AppendLine($"Kỹ năng: {StripHtml(cv.Skill?.Description)}");

            if (cv.Awards != null)
            {
                sb.AppendLine("Thành tích:");
                foreach (var award in cv.Awards)
                    sb.AppendLine($"- {award.Title}: {StripHtml(award.Description)}");
            }

            if (cv.Certificates != null)
            {
                sb.AppendLine("Chứng chỉ:");
                foreach (var cert in cv.Certificates)
                    sb.AppendLine($"- {cert.Title}: {StripHtml(cert.Description)}");
            }

            return sb.ToString();
        }

        public async Task<CVEvaluationResultDto> EvaluateCVWithNormalizationAsync(CVDto cv)
        {
            try
            {
                // Bước 1: Chuẩn hóa dữ liệu bằng Gemini (trả về JSON string)
                var normalizedJson = await NormalizeCVAsync(cv);

                // Kiểm tra nếu không có dữ liệu chuẩn hóa
                if (string.IsNullOrWhiteSpace(normalizedJson))
                    return new CVEvaluationResultDto();

                // Bước 2: Tạo prompt đánh giá từ dữ liệu đã chuẩn hóa
                string prompt = GenerateEvaluationPromptFromNormalized(normalizedJson);

                var requestBody = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[]
                            {
                                new { text = prompt }
                            }
                        }
                    }
                };

                string json = JsonSerializer.Serialize(requestBody);
                var request = new HttpRequestMessage(HttpMethod.Post, $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={_apiKey}")
                {
                    Content = new StringContent(json, Encoding.UTF8, "application/json")
                };

                var response = await _httpClient.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var jsonResponse = await response.Content.ReadAsStringAsync();

                // Kiểm tra response
                if (string.IsNullOrWhiteSpace(jsonResponse))
                    return new CVEvaluationResultDto();

                using var doc = JsonDocument.Parse(jsonResponse);
                var text = doc.RootElement
                              .GetProperty("candidates")[0]
                              .GetProperty("content")
                              .GetProperty("parts")[0]
                              .GetProperty("text")
                              .GetString();

                if (string.IsNullOrWhiteSpace(text))
                    return new CVEvaluationResultDto();

                // Loại bỏ các ký tự đặc biệt và markdown code block nếu có
                text = CleanJsonResponse(text);

                try
                {
                    var result = JsonSerializer.Deserialize<CVEvaluationResultDto>(text, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                    return result ?? new CVEvaluationResultDto();
                }
                catch (JsonException ex)
                {
                    Console.WriteLine($"JSON deserialize error: {ex.Message}");
                    Console.WriteLine($"Raw text: {text}");
                    return new CVEvaluationResultDto();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"EvaluateCVWithNormalizationAsync error: {ex.Message}");
                return new CVEvaluationResultDto();
            }
        }

        // Helper method để làm sạch văn bản trước khi deserialize
        private string CleanJsonResponse(string text)
        {
            // Gỡ bỏ các đoạn bắt đầu và kết thúc code block
            if (text.StartsWith("```") || text.Contains("```json"))
            {
                // Xóa bỏ markdown ```json hoặc ``` ở đầu
                text = Regex.Replace(text, @"^```(?:json)?[\r\n]", "", RegexOptions.Multiline);
                // Xóa bỏ markdown ``` ở cuối
                text = Regex.Replace(text, @"[\r\n]```$", "", RegexOptions.Multiline);
            }

            // Loại bỏ các ký tự backtick đơn lẻ
            text = text.Replace("`", "");

            // Loại bỏ khoảng trắng và xuống dòng ở đầu/cuối
            text = text.Trim();

            // Đảm bảo response là một JSON object hợp lệ
            if (!text.StartsWith("{") || !text.EndsWith("}"))
            {
                // Log nếu response không phải JSON hợp lệ
                Console.WriteLine($"Invalid JSON response: {text}");
                return "{}";
            }

            return text;
        }

        private string GenerateEvaluationPromptFromNormalized(string normalizedJson)
        {
            var sb = new StringBuilder();
            sb.AppendLine("Bạn là chuyên gia nhân sự. Hãy đánh giá CV dưới đây theo các khu vực: Thông tin, Giới thiệu, Kinh nghiệm, Kĩ năng, Học vấn, Dự án, Thành tích, Chứng chỉ, Giải thuởng."); //và bất kỳ trường nào khác mà bạn phát hiện.
            sb.AppendLine("Nếu khu vực nào không có thông tin, hãy chấm điểm 0 và nêu gợi ý.");
            sb.AppendLine("Riêng phần 'Thông tin', KHÔNG cần gợi ý bổ sung các liên kết như LinkedIn, GitHub cá nhân, trừ khi chúng đã có sẵn trong dữ liệu CV.");
            sb.AppendLine("Sau đó, quan trọng hãy kiểm tra và nhận xét về lỗi **chính tả tiếng việt, tiếng anh, ngữ pháp, từ vựng hoặc diễn đạt chưa tự nhiên** trong từng khu vực nếu có và ghi nó vào correction, nếu không có thì trả về null.");
            sb.AppendLine("Trả về kết quả dưới dạng JSON không có giải thích hay markdown bọc ngoài, chỉ JSON thuần túy với cấu trúc:");
            sb.AppendLine(@"
            {
             ""areas"": [
               {
                 ""area"": ""Tên khu vực"",
                 ""score"": 10,
                 ""description"": ""..."",
                 ""suggestion"": ""..."",
                 ""example"": ""..."",
                 ""correction"": ""...""
               }
             // ...
             ]
            }
            ");
            sb.AppendLine("Trong phần phản hồi:");
            sb.AppendLine("- Trường `suggestion` chỉ nên đưa ra gợi ý cải thiện tổng quát, KHÔNG bao gồm ví dụ cụ thể.");
            sb.AppendLine("- Trường `example` mới là nơi đưa ra một ví dụ minh họa cụ thể cho phần nội dung tốt.");
            sb.AppendLine("Dữ liệu CV chuẩn hóa:");
            sb.AppendLine(normalizedJson);
            return sb.ToString();
        }

        // Add this helper method to the class
        private string StripHtml(string? input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return string.Empty;

            return Regex.Replace(input, "<.*?>", string.Empty);
        }

        ////////// Suggestion
        public async Task<List<string>> SuggestJobsAsync(CVDto cv)
        {
            try
            {
                var prompt = GenerateJobSuggestionPrompt(cv);

                var requestBody = new
                {
                    contents = new[]
                    {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            }
                };

                var json = JsonSerializer.Serialize(requestBody);
                var request = new HttpRequestMessage(HttpMethod.Post, $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={_apiKey}")
                {
                    Content = new StringContent(json, Encoding.UTF8, "application/json")
                };

                var response = await _httpClient.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var jsonResponse = await response.Content.ReadAsStringAsync();
                if (string.IsNullOrWhiteSpace(jsonResponse))
                    return new List<string>();

                using var doc = JsonDocument.Parse(jsonResponse);
                var text = doc.RootElement
                              .GetProperty("candidates")[0]
                              .GetProperty("content")
                              .GetProperty("parts")[0]
                              .GetProperty("text")
                              .GetString();

                if (string.IsNullOrWhiteSpace(text))
                    return new List<string>();

                text = CleanJsonResponse(text);

                // Giả định Gemini trả về mảng JSON ["Job 1", "Job 2"]
                try
                {
                    var suggestions = JsonSerializer.Deserialize<List<string>>(text);
                    return suggestions ?? new List<string>();
                }
                catch (JsonException)
                {
                    Console.WriteLine($"Không thể parse JSON từ Gemini SuggestJobsAsync: {text}");
                    return new List<string>();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SuggestJobsAsync error: {ex.Message}");
                return new List<string>();
            }
        }

        private string GenerateJobSuggestionPrompt(CVDto cv)
        {
            var sb = new StringBuilder();
            sb.AppendLine("Bạn là AI chuyên gợi ý công việc cho ứng viên.");
            sb.AppendLine("Dưới đây là thông tin CV, hãy phân tích và trả về danh sách 5-10 vị trí công việc phù hợp nhất với kỹ năng, kinh nghiệm, dự án và định hướng nghề nghiệp của ứng viên.");
            sb.AppendLine("Trả về dưới dạng JSON array chỉ gồm tên công việc, không có markdown, không giải thích, không có thứ tự đánh số.");

            sb.AppendLine($"Họ tên: {cv.PersonalInfo?.FullName}");
            sb.AppendLine($"Vị trí mong muốn: {cv.PersonalInfo?.JobTitle}");
            sb.AppendLine($"Tóm tắt bản thân: {StripHtml(cv.PersonalInfo?.Overview)}");

            if (cv.Skill != null)
                sb.AppendLine($"Kỹ năng: {StripHtml(cv.Skill.Description)}");

            if (cv.Experiences != null)
            {
                sb.AppendLine("Kinh nghiệm:");
                foreach (var exp in cv.Experiences)
                {
                    sb.AppendLine($"- {exp.Title}: {StripHtml(exp.Description)}");
                }
            }

            if (cv.Projects != null)
            {
                sb.AppendLine("Dự án:");
                foreach (var proj in cv.Projects)
                {
                    sb.AppendLine($"- {proj.Title}: {StripHtml(proj.Description)}");
                }
            }

            if (cv.Certificates != null && cv.Certificates.Any(c => !string.IsNullOrEmpty(c.Title)))
            {
                sb.AppendLine("Chứng chỉ:");
                foreach (var cert in cv.Certificates)
                {
                    sb.AppendLine($"- {cert.Title}");
                }
            }

            return sb.ToString();
        }

    }


}