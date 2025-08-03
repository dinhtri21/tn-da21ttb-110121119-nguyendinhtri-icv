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
            sb.AppendLine("Bạn là chuyên gia nhân sự. Hãy đánh giá CV dưới đây theo các khu vực: Thông tin, Kinh nghiệm, Kĩ năng, Học vấn, Mục tiêu nghề nghiệp, Thành tích, và bất kỳ trường nào khác mà bạn phát hiện.");
            sb.AppendLine("Nếu phát hiện các nhóm kỹ năng hoặc thông tin đặc biệt (ví dụ: Ngôn ngữ, Frontend, Backend, Công cụ, Framework, Database, v.v.), hãy đánh giá riêng từng nhóm.");
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
    }
}