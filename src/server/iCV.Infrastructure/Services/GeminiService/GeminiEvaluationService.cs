using iCV.Application.Common.DTOs;
using iCV.Application.Common.Interfaces;
using iCV.Domain.Entities;
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

        public async Task<CVDto> ExtractCVDataFromPdfTextAsync(CVDto emptyCV, string pdfText)
        {
            try
            {
                string prompt = GenerateExtractCVDataPrompt(emptyCV, pdfText);

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
                    return emptyCV;

                using var doc = JsonDocument.Parse(jsonResponse);
                var text = doc.RootElement
                              .GetProperty("candidates")[0]
                              .GetProperty("content")
                              .GetProperty("parts")[0]
                              .GetProperty("text")
                              .GetString();

                if (string.IsNullOrWhiteSpace(text))
                    return emptyCV;

                // Làm sạch JSON response từ Gemini
                text = CleanJsonResponse(text);

                // Phân tích JSON và cập nhật emptyCV
                return UpdateCVFromGeminiResponse(emptyCV, text);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ExtractCVDataFromPdfTextAsync error: {ex.Message}");
                return emptyCV; // Trả về CV ban đầu nếu có lỗi
            }
        }

        private string GenerateExtractCVDataPrompt(CVDto emptyCV, string pdfText)
        {
            var sb = new StringBuilder();
            sb.AppendLine("Bạn là một AI chuyên gia trong việc phân tích CV. Tôi đã gửi cho bạn nội dung văn bản từ một file PDF CV.");
            sb.AppendLine("Vui lòng phân tích nội dung văn bản này và trả về một JSON với các thông tin sau:");
            sb.AppendLine();
            sb.AppendLine("1. PersonalInfo (thông tin cá nhân):");
            sb.AppendLine("   - FullName: Họ và tên của ứng viên");
            sb.AppendLine("   - JobTitle: Vị trí/chức danh ứng viên đang tìm kiếm");
            sb.AppendLine("   - Email: Địa chỉ email");
            sb.AppendLine("   - Phone: Số điện thoại");
            sb.AppendLine("   - Address: Địa chỉ (nếu có)");
            sb.AppendLine("   - Overview: Tóm tắt về bản thân, mục tiêu nghề nghiệp");
            sb.AppendLine();
            sb.AppendLine("2. Experiences (kinh nghiệm làm việc): Liệt kê các kinh nghiệm làm việc dưới dạng mảng, mỗi phần tử có:");
            sb.AppendLine("   - Title: Tên công ty và vị trí");
            sb.AppendLine("   - Description: Mô tả công việc (nếu có)");
            sb.AppendLine("   - StartDate: Thời gian bắt đầu (tháng/năm hoặc năm)");
            sb.AppendLine("   - EndDate: Thời gian kết thúc (tháng/năm hoặc năm)");
            sb.AppendLine();
            sb.AppendLine("3. Education (học vấn): Liệt kê học vấn dưới dạng mảng, mỗi phần tử có:");
            sb.AppendLine("   - UniversityName: Tên trường");
            sb.AppendLine("   - Description: Thông tin về ngành học, điểm số, v.v.");
            sb.AppendLine("   - StartDate: Thời gian bắt đầu (năm)");
            sb.AppendLine("   - EndDate: Thời gian kết thúc (năm)");
            sb.AppendLine();
            sb.AppendLine("4. Projects (dự án): Liệt kê các dự án dưới dạng mảng, mỗi phần tử có:");
            sb.AppendLine("   - Title: Tên dự án");
            sb.AppendLine("   - Description: Mô tả dự án");
            sb.AppendLine("   - StartDate: Thời gian bắt đầu (nếu có)");
            sb.AppendLine("   - EndDate: Thời gian kết thúc (nếu có)");
            sb.AppendLine();
            sb.AppendLine("5. Skills (kỹ năng):");
            sb.AppendLine("   - Description: Liệt kê các kỹ năng với format dạng danh sách '-' cho mỗi kỹ năng");
            sb.AppendLine();
            sb.AppendLine("6. Certificates (chứng chỉ): Liệt kê các chứng chỉ dưới dạng mảng, mỗi phần tử có:");
            sb.AppendLine("   - Title: Tên chứng chỉ");
            sb.AppendLine("   - Date: Ngày cấp (nếu có)");
            sb.AppendLine("   - Description: Mô tả thêm (nếu có)");
            sb.AppendLine();
            sb.AppendLine("7. Awards (giải thưởng): Liệt kê các giải thưởng dưới dạng mảng, mỗi phần tử có:");
            sb.AppendLine("   - Title: Tên giải thưởng");
            sb.AppendLine("   - Date: Ngày đạt được (nếu có)");
            sb.AppendLine("   - Description: Mô tả thêm (nếu có)");
            sb.AppendLine();
            sb.AppendLine("8. Language (ngôn ngữ CV):");
            sb.AppendLine("   - Xác định CV này viết bằng ngôn ngữ gì. Trả về 'vi' nếu là tiếng Việt, 'en' nếu là tiếng Anh");
            sb.AppendLine();
            sb.AppendLine("Đảm bảo format data phù hợp để có thể parse thành JSON. Trả về kết quả là một đối tượng JSON hoàn chỉnh có tất cả các trường trên (nếu không tìm thấy thông tin, hãy để trống hoặc null).");
            sb.AppendLine("Nội dung CV từ PDF:");
            sb.AppendLine(pdfText.Length > 5000 ? pdfText.Substring(0, 5000) + "..." : pdfText);
            
            return sb.ToString();
        }

        private CVDto UpdateCVFromGeminiResponse(CVDto cvDto, string jsonResponse)
        {
            try
            {
                using (JsonDocument doc = JsonDocument.Parse(jsonResponse))
                {
                    var root = doc.RootElement;

                    // Kiểm tra và cập nhật ngôn ngữ CV
                    if (root.TryGetProperty("Language", out var languageElement) && languageElement.ValueKind == JsonValueKind.String)
                    {
                        string language = languageElement.GetString();
                        if (!string.IsNullOrEmpty(language) && (language == "vi" || language == "en"))
                        {
                            cvDto.Template.Language = language;
                        }
                    }

                    // Cập nhật thông tin cá nhân
                    if (root.TryGetProperty("PersonalInfo", out var personalInfoElement) && personalInfoElement.ValueKind == JsonValueKind.Object)
                    {
                        if (personalInfoElement.TryGetProperty("FullName", out var fullNameElement) && fullNameElement.ValueKind == JsonValueKind.String)
                            cvDto.PersonalInfo.FullName = fullNameElement.GetString();

                        if (personalInfoElement.TryGetProperty("JobTitle", out var jobTitleElement) && jobTitleElement.ValueKind == JsonValueKind.String)
                            cvDto.PersonalInfo.JobTitle = jobTitleElement.GetString();

                        if (personalInfoElement.TryGetProperty("Email", out var emailElement) && emailElement.ValueKind == JsonValueKind.String)
                            cvDto.PersonalInfo.Email = emailElement.GetString();

                        if (personalInfoElement.TryGetProperty("Phone", out var phoneElement) && phoneElement.ValueKind == JsonValueKind.String)
                            cvDto.PersonalInfo.Phone = phoneElement.GetString();

                        if (personalInfoElement.TryGetProperty("Address", out var addressElement) && addressElement.ValueKind == JsonValueKind.String)
                            cvDto.PersonalInfo.Address = addressElement.GetString();

                        if (personalInfoElement.TryGetProperty("Overview", out var overviewElement) && overviewElement.ValueKind == JsonValueKind.String)
                            cvDto.PersonalInfo.Overview = overviewElement.GetString();
                    }

                    // Cập nhật kinh nghiệm làm việc
                    if (root.TryGetProperty("Experiences", out var experiencesElement) && experiencesElement.ValueKind == JsonValueKind.Array)
                    {
                        cvDto.Experiences = new List<Experience>();
                        int expId = 1;

                        foreach (var expElement in experiencesElement.EnumerateArray())
                        {
                            var experience = new Experience { Id = expId++ };

                            if (expElement.TryGetProperty("Title", out var titleElement) && titleElement.ValueKind == JsonValueKind.String)
                                experience.Title = titleElement.GetString();

                            if (expElement.TryGetProperty("Description", out var descElement) && descElement.ValueKind == JsonValueKind.String)
                                experience.Description = descElement.GetString();

                            if (expElement.TryGetProperty("StartDate", out var startElement) && startElement.ValueKind == JsonValueKind.String)
                                experience.StartDate = startElement.GetString();

                            if (expElement.TryGetProperty("EndDate", out var endElement) && endElement.ValueKind == JsonValueKind.String)
                                experience.EndDate = endElement.GetString();
                            else if (expElement.TryGetProperty("CurrentlyWorking", out var currentWorkingElement) && 
                                     currentWorkingElement.ValueKind == JsonValueKind.True)
                                experience.CurrentlyWorking = true;

                            cvDto.Experiences.Add(experience);
                        }
                    }

                    // Cập nhật học vấn
                    if (root.TryGetProperty("Education", out var educationElement) && educationElement.ValueKind == JsonValueKind.Array)
                    {
                        cvDto.Education = new List<Education>();
                        int eduId = 1;

                        foreach (var eduElement in educationElement.EnumerateArray())
                        {
                            var education = new Education { Id = eduId++ };

                            if (eduElement.TryGetProperty("UniversityName", out var uniElement) && uniElement.ValueKind == JsonValueKind.String)
                                education.UniversityName = uniElement.GetString();
                            else if (eduElement.TryGetProperty("School", out var schoolElement) && schoolElement.ValueKind == JsonValueKind.String)
                                education.UniversityName = schoolElement.GetString();

                            if (eduElement.TryGetProperty("Description", out var descElement) && descElement.ValueKind == JsonValueKind.String)
                                education.Description = descElement.GetString();

                            if (eduElement.TryGetProperty("StartDate", out var startElement) && startElement.ValueKind == JsonValueKind.String)
                                education.StartDate = startElement.GetString();

                            if (eduElement.TryGetProperty("EndDate", out var endElement) && endElement.ValueKind == JsonValueKind.String)
                                education.EndDate = endElement.GetString();

                            cvDto.Education.Add(education);
                        }
                    }

                    // Cập nhật dự án
                    if (root.TryGetProperty("Projects", out var projectsElement) && projectsElement.ValueKind == JsonValueKind.Array)
                    {
                        cvDto.Projects = new List<Project>();
                        int projId = 1;

                        foreach (var projElement in projectsElement.EnumerateArray())
                        {
                            var project = new Project { Id = projId++ };

                            if (projElement.TryGetProperty("Title", out var titleElement) && titleElement.ValueKind == JsonValueKind.String)
                                project.Title = titleElement.GetString();

                            if (projElement.TryGetProperty("Description", out var descElement) && descElement.ValueKind == JsonValueKind.String)
                                project.Description = descElement.GetString();

                            if (projElement.TryGetProperty("StartDate", out var startElement) && startElement.ValueKind == JsonValueKind.String)
                                project.StartDate = startElement.GetString();

                            if (projElement.TryGetProperty("EndDate", out var endElement) && endElement.ValueKind == JsonValueKind.String)
                                project.EndDate = endElement.GetString();

                            cvDto.Projects.Add(project);
                        }
                    }

                    // Cập nhật kỹ năng
                    if (root.TryGetProperty("Skills", out var skillsElement))
                    {
                        if (skillsElement.TryGetProperty("Description", out var descElement) && descElement.ValueKind == JsonValueKind.String)
                        {
                            cvDto.Skill.Description = descElement.GetString();
                        }
                        else if (skillsElement.ValueKind == JsonValueKind.Array)
                        {
                            // Nếu kỹ năng là một mảng, chuyển đổi thành danh sách có định dạng
                            StringBuilder skillBuilder = new StringBuilder();
                            foreach (var skill in skillsElement.EnumerateArray())
                            {
                                if (skill.ValueKind == JsonValueKind.String)
                                    skillBuilder.AppendLine($"- {skill.GetString()}");
                            }
                            cvDto.Skill.Description = skillBuilder.ToString();
                        }
                    }

                    // Cập nhật chứng chỉ
                    if (root.TryGetProperty("Certificates", out var certsElement) && certsElement.ValueKind == JsonValueKind.Array)
                    {
                        cvDto.Certificates = new List<Certificate>();
                        int certId = 1;

                        foreach (var certElement in certsElement.EnumerateArray())
                        {
                            var certificate = new Certificate { Id = certId++ };

                            if (certElement.ValueKind == JsonValueKind.String)
                            {
                                certificate.Title = certElement.GetString();
                            }
                            else
                            {
                                if (certElement.TryGetProperty("Title", out var titleElement) && titleElement.ValueKind == JsonValueKind.String)
                                    certificate.Title = titleElement.GetString();

                                if (certElement.TryGetProperty("Date", out var dateElement) && dateElement.ValueKind == JsonValueKind.String)
                                    certificate.Date = dateElement.GetString();

                                if (certElement.TryGetProperty("Description", out var descElement) && descElement.ValueKind == JsonValueKind.String)
                                    certificate.Description = descElement.GetString();
                            }

                            cvDto.Certificates.Add(certificate);
                        }
                    }

                    // Cập nhật giải thưởng
                    if (root.TryGetProperty("Awards", out var awardsElement) && awardsElement.ValueKind == JsonValueKind.Array)
                    {
                        cvDto.Awards = new List<Award>();

                        foreach (var awardElement in awardsElement.EnumerateArray())
                        {
                            var award = new Award { Id = Guid.NewGuid().ToString() };

                            if (awardElement.ValueKind == JsonValueKind.String)
                            {
                                award.Title = awardElement.GetString();
                            }
                            else
                            {
                                if (awardElement.TryGetProperty("Title", out var titleElement) && titleElement.ValueKind == JsonValueKind.String)
                                    award.Title = titleElement.GetString();

                                if (awardElement.TryGetProperty("Date", out var dateElement) && dateElement.ValueKind == JsonValueKind.String)
                                    award.Date = dateElement.GetString();

                                if (awardElement.TryGetProperty("Description", out var descElement) && descElement.ValueKind == JsonValueKind.String)
                                    award.Description = descElement.GetString();
                            }

                            cvDto.Awards.Add(award);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating CV from Gemini response: {ex.Message}");
                // Giữ nguyên CVDto ban đầu nếu có lỗi
            }

            return cvDto;
        }
    }


}