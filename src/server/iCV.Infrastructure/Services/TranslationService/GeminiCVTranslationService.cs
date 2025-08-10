using iCV.Application.Common.DTOs;
using iCV.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace iCV.Infrastructure.Services.TranslationService
{
    public class GeminiCVTranslationService : ICVTranslationService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public GeminiCVTranslationService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _apiKey = config["Gemini:ApiKey"];
        }

        public async Task<CVDto> TranslateCVAsync(CVDto cv, string targetLanguage)
        {
            try
            {
                // Tạo bản sao của CV để không ảnh hưởng đến CV gốc
                var translatedCV = CloneCV(cv);
                
                // Chuẩn bị dữ liệu CV để dịch
                var cvDataJson = SerializeCVForTranslation(cv);
                
                // Xác định ngôn ngữ nguồn dựa trên phân tích nội dung
                string sourceLanguage = targetLanguage == "vi" ? "en" : "vi";
                
                // Gọi API Gemini để dịch
                var translatedJson = await TranslateJsonWithGemini(cvDataJson, sourceLanguage, targetLanguage);
                
                // Kiểm tra xem Gemini có báo CV đã ở ngôn ngữ đích không
                bool alreadyInTargetLanguage = false;
                try
                {
                    using var doc = JsonDocument.Parse(translatedJson);
                    if (doc.RootElement.TryGetProperty("AlreadyInTargetLanguage", out var flag) && flag.ValueKind == JsonValueKind.True)
                    {
                        alreadyInTargetLanguage = true;
                    }
                }
                catch
                {
                    // Bỏ qua lỗi phân tích JSON, coi như cần dịch
                }
                
                if (alreadyInTargetLanguage)
                {
                    return translatedCV;
                }
                
                // Cập nhật CV với dữ liệu đã dịch
                UpdateCVFromTranslatedJson(translatedCV, translatedJson);
                
                // Cập nhật ngôn ngữ đích
                if (translatedCV.Template != null)
                {
                    translatedCV.Template.Language = targetLanguage;
                }
                
                return translatedCV;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"TranslateCVAsync error: {ex.Message}");
                // Trả về CV gốc nếu có lỗi
                return cv;
            }
        }

        private CVDto CloneCV(CVDto source)
        {
            // Tạo một bản sao của CV để không ảnh hưởng đến dữ liệu gốc
            // Sử dụng deep clone để tránh các vấn đề tham chiếu
            var json = JsonSerializer.Serialize(source);
            return JsonSerializer.Deserialize<CVDto>(json) ?? new CVDto();
        }

        private string SerializeCVForTranslation(CVDto cv)
        {
            // Tạo một đối tượng chứa các phần cần dịch của CV
            var translationData = new
            {
                PersonalInfo = new
                {
                    FullName = cv.PersonalInfo?.FullName,
                    JobTitle = cv.PersonalInfo?.JobTitle,
                    Overview = cv.PersonalInfo?.Overview,
                    // Không dịch các trường như email, phone, address
                },
                Experiences = cv.Experiences?.Select(exp => new
                {
                    Title = exp.Title,
                    Description = exp.Description,
                    // Giữ nguyên các trường ngày tháng
                }).ToList(),
                Education = cv.Education?.Select(edu => new
                {
                    UniversityName = edu.UniversityName,
                    Description = edu.Description,
                    // Giữ nguyên các trường ngày tháng
                }).ToList(),
                Projects = cv.Projects?.Select(proj => new
                {
                    Title = proj.Title,
                    Description = proj.Description,
                    // Giữ nguyên các trường ngày tháng
                }).ToList(),
                Skills = cv.Skill?.Description,
                Certificates = cv.Certificates?.Select(cert => new
                {
                    Title = cert.Title,
                    Description = cert.Description,
                    // Giữ nguyên các trường ngày tháng
                }).ToList(),
                Awards = cv.Awards?.Select(award => new
                {
                    Title = award.Title,
                    Description = award.Description,
                    // Giữ nguyên các trường ngày tháng
                }).ToList()
            };

            return JsonSerializer.Serialize(translationData, new JsonSerializerOptions
            {
                WriteIndented = true
            });
        }

        private async Task<string> TranslateJsonWithGemini(string jsonData, string sourceLanguage, string targetLanguage)
        {
            string languageDirection = sourceLanguage == "vi" ? "Việt sang Anh" : "Anh sang Việt";
            string targetLanguageName = (targetLanguage == "vi") ? "Việt" : "Anh";
            
            var prompt = new StringBuilder();
            prompt.AppendLine($"Bạn là một chuyên gia dịch thuật CV từ tiếng {languageDirection}. Tôi cần bạn dịch tất cả nội dung văn bản trong JSON này sang tiếng {targetLanguageName}.");
            prompt.AppendLine("Trước tiên, hãy phân tích nhanh nội dung JSON để xác định ngôn ngữ hiện tại thực tế của nó.");
            prompt.AppendLine("Nếu nội dung đã ở đúng ngôn ngữ đích, hãy trả về JSON nguyên bản và thêm trường \"AlreadyInTargetLanguage\": true.");
            prompt.AppendLine("Nếu cần dịch, hãy dịch tất cả nội dung và trả về JSON không có trường AlreadyInTargetLanguage.");
            prompt.AppendLine("Hãy giữ nguyên cấu trúc JSON, chỉ dịch giá trị của các trường nội dung.");
            prompt.AppendLine("Không dịch các URL, email, số điện thoại, tên riêng của các công ty hoặc sản phẩm công nghệ.");
            prompt.AppendLine("Đối với các kỹ năng chuyên môn hoặc thuật ngữ kỹ thuật, hãy giữ nguyên thuật ngữ tiếng Anh nếu cần thiết.");
            prompt.AppendLine("Hãy đảm bảo bản dịch tự nhiên, chính xác và phù hợp với ngữ cảnh CV chuyên nghiệp.");
            prompt.AppendLine("Trả về JSON kết quả hoàn chỉnh, không có giải thích hay định dạng markdown.");
            prompt.AppendLine("\nJSON cần dịch:");
            prompt.AppendLine(jsonData);

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt.ToString() }
                        }
                    }
                }
            };

            string requestJson = JsonSerializer.Serialize(requestBody);
            var request = new HttpRequestMessage(HttpMethod.Post, $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={_apiKey}")
            {
                Content = new StringContent(requestJson, Encoding.UTF8, "application/json")
            };

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var responseJson = await response.Content.ReadAsStringAsync();
            if (string.IsNullOrWhiteSpace(responseJson))
                return "{}";

            using var doc = JsonDocument.Parse(responseJson);
            var text = doc.RootElement
                   .GetProperty("candidates")[0]
                   .GetProperty("content")
                   .GetProperty("parts")[0]
                   .GetProperty("text")
                   .GetString();

            if (string.IsNullOrWhiteSpace(text))
                return "{}";

            // Làm sạch JSON response từ Gemini
            return CleanJsonResponse(text);
        }

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

        private void UpdateCVFromTranslatedJson(CVDto cv, string translatedJson)
        {
            try
            {
                using var doc = JsonDocument.Parse(translatedJson);
                var root = doc.RootElement;

                // Cập nhật PersonalInfo
                if (root.TryGetProperty("PersonalInfo", out var personalInfoElement) && personalInfoElement.ValueKind == JsonValueKind.Object)
                {
                    if (personalInfoElement.TryGetProperty("FullName", out var fullNameElement) && fullNameElement.ValueKind == JsonValueKind.String)
                        cv.PersonalInfo.FullName = fullNameElement.GetString();

                    if (personalInfoElement.TryGetProperty("JobTitle", out var jobTitleElement) && jobTitleElement.ValueKind == JsonValueKind.String)
                        cv.PersonalInfo.JobTitle = jobTitleElement.GetString();

                    if (personalInfoElement.TryGetProperty("Overview", out var overviewElement) && overviewElement.ValueKind == JsonValueKind.String)
                        cv.PersonalInfo.Overview = overviewElement.GetString();
                }

                // Cập nhật Experiences
                if (root.TryGetProperty("Experiences", out var experiencesElement) && experiencesElement.ValueKind == JsonValueKind.Array && cv.Experiences != null)
                {
                    int expIndex = 0;
                    foreach (var expElement in experiencesElement.EnumerateArray())
                    {
                        if (expIndex < cv.Experiences.Count)
                        {
                            if (expElement.TryGetProperty("Title", out var titleElement) && titleElement.ValueKind == JsonValueKind.String)
                                cv.Experiences[expIndex].Title = titleElement.GetString();

                            if (expElement.TryGetProperty("Description", out var descElement) && descElement.ValueKind == JsonValueKind.String)
                                cv.Experiences[expIndex].Description = descElement.GetString();

                            expIndex++;
                        }
                    }
                }

                // Cập nhật Education
                if (root.TryGetProperty("Education", out var educationElement) && educationElement.ValueKind == JsonValueKind.Array && cv.Education != null)
                {
                    int eduIndex = 0;
                    foreach (var eduElement in educationElement.EnumerateArray())
                    {
                        if (eduIndex < cv.Education.Count)
                        {
                            if (eduElement.TryGetProperty("UniversityName", out var uniElement) && uniElement.ValueKind == JsonValueKind.String)
                                cv.Education[eduIndex].UniversityName = uniElement.GetString();

                            if (eduElement.TryGetProperty("Description", out var descElement) && descElement.ValueKind == JsonValueKind.String)
                                cv.Education[eduIndex].Description = descElement.GetString();

                            eduIndex++;
                        }
                    }
                }

                // Cập nhật Projects
                if (root.TryGetProperty("Projects", out var projectsElement) && projectsElement.ValueKind == JsonValueKind.Array && cv.Projects != null)
                {
                    int projIndex = 0;
                    foreach (var projElement in projectsElement.EnumerateArray())
                    {
                        if (projIndex < cv.Projects.Count)
                        {
                            if (projElement.TryGetProperty("Title", out var titleElement) && titleElement.ValueKind == JsonValueKind.String)
                                cv.Projects[projIndex].Title = titleElement.GetString();

                            if (projElement.TryGetProperty("Description", out var descElement) && descElement.ValueKind == JsonValueKind.String)
                                cv.Projects[projIndex].Description = descElement.GetString();

                            projIndex++;
                        }
                    }
                }

                // Cập nhật Skills
                if (root.TryGetProperty("Skills", out var skillsElement) && skillsElement.ValueKind == JsonValueKind.String)
                {
                    cv.Skill.Description = skillsElement.GetString();
                }

                // Cập nhật Certificates
                if (root.TryGetProperty("Certificates", out var certsElement) && certsElement.ValueKind == JsonValueKind.Array && cv.Certificates != null)
                {
                    int certIndex = 0;
                    foreach (var certElement in certsElement.EnumerateArray())
                    {
                        if (certIndex < cv.Certificates.Count)
                        {
                            if (certElement.TryGetProperty("Title", out var titleElement) && titleElement.ValueKind == JsonValueKind.String)
                                cv.Certificates[certIndex].Title = titleElement.GetString();

                            if (certElement.TryGetProperty("Description", out var descElement) && descElement.ValueKind == JsonValueKind.String)
                                cv.Certificates[certIndex].Description = descElement.GetString();

                            certIndex++;
                        }
                    }
                }

                // Cập nhật Awards
                if (root.TryGetProperty("Awards", out var awardsElement) && awardsElement.ValueKind == JsonValueKind.Array && cv.Awards != null)
                {
                    int awardIndex = 0;
                    foreach (var awardElement in awardsElement.EnumerateArray())
                    {
                        if (awardIndex < cv.Awards.Count)
                        {
                            if (awardElement.TryGetProperty("Title", out var titleElement) && titleElement.ValueKind == JsonValueKind.String)
                                cv.Awards[awardIndex].Title = titleElement.GetString();

                            if (awardElement.TryGetProperty("Description", out var descElement) && descElement.ValueKind == JsonValueKind.String)
                                cv.Awards[awardIndex].Description = descElement.GetString();

                            awardIndex++;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating CV from translated JSON: {ex.Message}");
                // Giữ nguyên CV ban đầu nếu có lỗi
            }
        }
    }
}