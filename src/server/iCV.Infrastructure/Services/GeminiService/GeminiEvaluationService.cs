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

                // Bước 2: Tạo prompt kiểm tra lỗi chính tả từ dữ liệu đã chuẩn hóa
                string spellCheckPrompt = GenerateSpellCheckPromptFromNormalized(normalizedJson);
                
                // Bước 3: Gọi API để kiểm tra lỗi chính tả
                var spellCheckResult = await CallGeminiAPI(spellCheckPrompt);

                // Bước 4: Tạo prompt đánh giá CV từ dữ liệu đã chuẩn hóa
                string evaluationPrompt = GenerateEvaluationPromptFromNormalized(normalizedJson);
                
                // Bước 5: Gọi API để đánh giá CV
                var evaluationResult = await CallGeminiAPI(evaluationPrompt);

                // Bước 6: Kết hợp kết quả từ hai lần gọi API
                var combinedResult = CombineResults(spellCheckResult, evaluationResult);

                return combinedResult;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"EvaluateCVWithNormalizationAsync error: {ex.Message}");
                return new CVEvaluationResultDto();
            }
        }

        // Phương thức tạo prompt chỉ tập trung vào kiểm tra lỗi chính tả và ngữ pháp
        private string GenerateSpellCheckPromptFromNormalized(string normalizedJson)
        {
            var sb = new StringBuilder();

            // PHẦN 1: NHIỆM VỤ VÀ MỤC TIÊU CHÍNH
            sb.AppendLine("!!! NHIỆM VỤ DUY NHẤT CỦA BẠN: KIỂM TRA LỖI CHÍNH TẢ, NGỮ PHÁP VÀ DIỄN ĐẠT TRONG CV !!!");
            sb.AppendLine("Bạn CHÍNH XÁC là một chuyên gia ngôn ngữ, chuyên kiểm tra lỗi chính tả và ngữ pháp. KHÔNG làm bất kỳ việc đánh giá nội dung nào khác.");
            sb.AppendLine("Bạn có kiến thức sâu rộng về cả tiếng Việt và tiếng Anh, đặc biệt là các thuật ngữ kỹ thuật trong lĩnh vực công nghệ thông tin.");
            sb.AppendLine("");
            sb.AppendLine("Với MỖI khu vực của CV (Thông tin, Giới thiệu, Kinh nghiệm, Kĩ năng, Học vấn, Dự án, Thành tích, Chứng chỉ, Giải thưởng), bạn CHỈ làm MỘT việc duy nhất:");
            sb.AppendLine("- Kiểm tra KỸ LƯỠNG các lỗi chính tả tiếng Việt/tiếng Anh, ngữ pháp, từ vựng, và diễn đạt không tự nhiên.");
            sb.AppendLine("- Ghi RÕ RÀNG những lỗi này vào trường 'correction' của khu vực tương ứng.");
            sb.AppendLine("- Nếu THỰC SỰ không có lỗi nào, hãy đặt trường 'correction' là null.");

            // PHẦN 2: QUY TRÌNH KIỂM TRA LỖI CHÍNH TẢ
            sb.AppendLine("\nQUY TRÌNH KIỂM TRA LỖI CHÍNH TẢ:");
            sb.AppendLine("1. Đọc kỹ từng câu trong CV và kiểm tra từng từ một.");
            sb.AppendLine("2. Kiểm tra đặc biệt các thuật ngữ kỹ thuật, tên công nghệ, tên công ty.");
            sb.AppendLine("3. Kiểm tra dấu câu và khoảng cách giữa các từ.");
            sb.AppendLine("4. Kiểm tra nhất quán trong cách viết (vd: JavaScript vs Javascript).");
            sb.AppendLine("5. Kiểm tra các từ bị dính liền không đúng (vd: côngnghệ, lậptrình, triểnkhai).");

            // PHẦN 3: DANH SÁCH CÁC LỖI THƯỜNG GẶP
            sb.AppendLine("\nCÁC LỖI THƯỜNG GẶP CẦN KIỂM TRA:");
            sb.AppendLine("- Lỗi chính tả tiếng Việt: thiếu dấu, sai dấu, sai chính tả (vd: nghên cứu, phát triễn, trien khai)");
            sb.AppendLine("- Lỗi chính tả tiếng Anh: sai chính tả (vd: Deverloper, Font-end, Javascipt, experence)");
            sb.AppendLine("- Lỗi thuật ngữ công nghệ: viết sai tên công nghệ (vd: React Js, Node JS, Vue js thay vì ReactJS, Node.js, Vue.js)");
            sb.AppendLine("- Lỗi viết hoa: không viết hoa tên riêng, tên công nghệ (vd: javascript thay vì JavaScript)");
            sb.AppendLine("- Lỗi khoảng trắng: thiếu hoặc thừa khoảng trắng (vd: ReactNative thay vì React Native)");
            sb.AppendLine("- Lỗi từ dính liền: các từ bị dính liền không đúng (vd: côngnghệ, kỹnăng, lậptrình, ngônngữ, full-stackdeveloper)");
            sb.AppendLine("- Lỗi nhất quán: dùng nhiều cách viết khác nhau cho cùng một thuật ngữ");
            sb.AppendLine("- Các từ viết sai thường gặp: font-end/front-end, back-end/back end, full-stack/fullstack, javascrip/javascript");
            sb.AppendLine("- Hay bất cứ lỗi nào khác bạn bắt gặp được");

            // PHẦN 4: ĐỊNH DẠNG CORRECTION
            sb.AppendLine("\nĐỊNH DẠNG CORRECTION PHẢI CHÍNH XÁC NHƯ SAU:");
            sb.AppendLine("<p>Lỗi: <span style=\"color: red;\">phát triễn</span> => <span style=\"color: green;\">phát triển</span></p>");
            sb.AppendLine("<p>Lỗi: <span style=\"color: red;\">Deverloper</span> => <span style=\"color: green;\">Developer</span></p>");
            sb.AppendLine("<p>Lỗi: <span style=\"color: red;\">trien khai</span> => <span style=\"color: green;\">triển khai</span></p>");
            sb.AppendLine("<p>Lỗi: <span style=\"color: red;\">triểnkhai</span> => <span style=\"color: green;\">triển khai</span></p>");
            sb.AppendLine("<p>Lỗi: <span style=\"color: red;\">javascript</span> => <span style=\"color: green;\">JavaScript</span></p>");
            sb.AppendLine("<p>Lỗi: <span style=\"color: red;\">react js</span> => <span style=\"color: green;\">React.js</span></p>");
            sb.AppendLine("<p>Lỗi: <span style=\"color: red;\">côngnghệ</span> => <span style=\"color: green;\">công nghệ</span></p>");

            // PHẦN 5: HƯỚNG DẪN CHO NHIỀU LỖI
            sb.AppendLine("\nNẾU CÓ NHIỀU LỖI, PHẢI LIỆT KÊ TỪNG LỖI TRONG THẺ <p> RIÊNG:");
            sb.AppendLine("<p>Lỗi: <span style=\"color: red;\">phát triễn</span> => <span style=\"color: green;\">phát triển</span></p>");
            sb.AppendLine("<p>Lỗi: <span style=\"color: red;\">kinh ngiệm</span> => <span style=\"color: green;\">kinh nghiệm</span></p>");
            sb.AppendLine("<p>Lỗi: <span style=\"color: red;\">triểm khai</span> => <span style=\"color: green;\">triển khai</span></p>");
    
            // PHẦN 6: KIỂM TRA CHI TIẾT TỪNG KHU VỰC
            sb.AppendLine("\nKIỂM TRA CHI TIẾT TỪNG KHU VỰC:");
            sb.AppendLine("1. Thông tin: Kiểm tra lỗi chính tả trong họ tên, địa chỉ, vị trí ứng tuyển, email, số điện thoại.");
            sb.AppendLine("2. Kinh nghiệm: Kiểm tra lỗi chính tả trong Title và Description.");
            sb.AppendLine("3. Học vấn: Kiểm tra lỗi chính tả trong UniversityName và Description.");
            sb.AppendLine("4. Dự án: Kiểm tra lỗi chính tả trong Title và Description. (Lưu ý có nhiều dự án)");
            sb.AppendLine("5. Kỹ năng: Kiểm tra lỗi chính tả trong mô tả kỹ năng, đặc biệt là tên các công nghệ, ngôn ngữ lập trình.");
            sb.AppendLine("6. Chứng chỉ: Kiểm tra lỗi chính tả trong Title và Description.");
            sb.AppendLine("7. Giải thưởng: Kiểm tra lỗi chính tả trong Title và Description.");

            // PHẦN 7: ĐỊNH DẠNG JSON VÀ CÁC TRƯỜNG
            sb.AppendLine("\nTrả về kết quả dưới dạng JSON không có giải thích hay markdown bọc ngoài, chỉ JSON thuần túy với cấu trúc:");
            sb.AppendLine(@"
{
 ""areas"": [
   {
     ""area"": ""Tên khu vực"",
     ""score"": 0,
     ""description"": """",
     ""suggestion"": """",
     ""example"": """",
     ""correction"": ""<p>Lỗi: <span style=\""color: red;\"">phát triễn</span> => <span style=\""color: green;\"">phát triển</span></p>""
   }
 ]
}
");
            sb.AppendLine("Lưu ý: Chỉ điền trường 'correction', các trường khác để trống hoặc giá trị mặc định. Score luôn để là 0.");
            sb.AppendLine("Trường 'correction' PHẢI sử dụng thẻ <p> và <span> với thuộc tính style cho màu sắc để hiển thị lỗi và cách sửa.");

            // PHẦN 8: DỮ LIỆU CV
            sb.AppendLine("\nDữ liệu CV chuẩn hóa:");
            sb.AppendLine(normalizedJson);

            return sb.ToString();
        }

        // Phương thức tạo prompt chỉ tập trung vào đánh giá CV
        private string GenerateEvaluationPromptFromNormalized(string normalizedJson)
        {
            var sb = new StringBuilder();

            // PHẦN 1: NHIỆM VỤ VÀ MỤC TIÊU CHÍNH
            sb.AppendLine("!!! NHIỆM VỤ DUY NHẤT CỦA BẠN: ĐÁNH GIÁ CHẤT LƯỢNG CV !!!");
            sb.AppendLine("Bạn CHÍNH XÁC là một chuyên gia nhân sự đánh giá CV. KHÔNG kiểm tra lỗi chính tả hay ngữ pháp.");
            sb.AppendLine("Tập trung vào việc đánh giá nội dung, cấu trúc và sự phù hợp của CV với vị trí ứng tuyển.");
            sb.AppendLine("");
            sb.AppendLine("Với MỖI khu vực của CV (Thông tin, Giới thiệu, Kinh nghiệm, Kĩ năng, Học vấn, Dự án, Thành tích, Chứng chỉ, Giải thưởng), bạn PHẢI:");
            sb.AppendLine("1. Đánh giá mức độ đầy đủ và phù hợp của thông tin");
            sb.AppendLine("2. Đề xuất các cải thiện cụ thể để nâng cao chất lượng CV");
            sb.AppendLine("3. Cung cấp ví dụ minh họa cho các cải thiện được đề xuất");
            sb.AppendLine("4. Cho điểm từng khu vực (0-10) dựa trên mức độ hoàn thiện, nếu khu vực nào không có thông tin thì 0 điểm");

            // PHẦN 2: TIÊU CHÍ ĐÁNH GIÁ
            sb.AppendLine("\nTIÊU CHÍ ĐÁNH GIÁ:");
            sb.AppendLine("1. Đầy đủ: Thông tin có đầy đủ và chi tiết không");
            sb.AppendLine("2. Phù hợp: Thông tin có phù hợp với vị trí ứng tuyển không");
            sb.AppendLine("3. Cụ thể: Thông tin có được trình bày cụ thể, rõ ràng không");
            sb.AppendLine("4. Định dạng: Thông tin có được trình bày với định dạng phù hợp không");
            sb.AppendLine("5. Tổ chức: Thông tin có được tổ chức logic, dễ theo dõi không");

            // PHẦN 3: HƯỚNG DẪN ĐÁNH GIÁ TỪNG KHU VỰC
            sb.AppendLine("\nHƯỚNG DẪN ĐÁNH GIÁ TỪNG KHU VỰC:");
            
            sb.AppendLine("\n1. KHU VỰC THÔNG TIN:");
            sb.AppendLine("- Kiểm tra đầy đủ thông tin cơ bản: họ tên, email, số điện thoại, địa chỉ, vị trí ứng tuyển.");
            sb.AppendLine("- KHÔNG cần gợi ý bổ sung các liên kết như LinkedIn, GitHub cá nhân, trừ khi chúng đã có sẵn trong dữ liệu CV.");

            sb.AppendLine("\n2. KHU VỰC KINH NGHIỆM:");
            sb.AppendLine("- Đánh giá mức độ chi tiết và phù hợp của kinh nghiệm với vị trí ứng tuyển.");
            sb.AppendLine("- Định dạng ngày tháng: Kiểm tra StartDate và EndDate có định dạng MM/YYYY.");
            sb.AppendLine("- EndDate trống nhưng có CurrentlyWorking=true, hoặc EndDate là \"Hiện tại\" hay \"Present\" đều là định dạng hợp lệ.");
            sb.AppendLine("- Chỉ gợi ý bổ sung thông tin thời gian khi hoàn toàn không có thông tin StartDate và EndDate và CurrentlyWorking=false.");

            sb.AppendLine("\n3. KHU VỰC HỌC VẤN:");
            sb.AppendLine("- Đánh giá mức độ chi tiết và phù hợp của học vấn với vị trí ứng tuyển.");
            sb.AppendLine("- Định dạng ngày tháng: Kiểm tra StartDate và EndDate có định dạng MM/YYYY.");
            sb.AppendLine("- Chỉ gợi ý bổ sung thông tin thời gian khi không có bất kỳ thông tin StartDate và EndDate nào.");
            sb.AppendLine("- Kiểm tra có đầy đủ thông tin về tên trường");
            sb.AppendLine("- Gợi ý nếu không có thông tin về ngành học, GPA,...");

            sb.AppendLine("\n4. KHU VỰC DỰ ÁN:");
            sb.AppendLine("- Đánh giá mức độ chi tiết và phù hợp của dự án với vị trí ứng tuyển.");
            sb.AppendLine("- Định dạng ngày tháng: Kiểm tra StartDate và EndDate có định dạng MM/YYYY");
            sb.AppendLine("- Chỉ gợi ý bổ sung ngày tháng khi không có thông tin thời gian nào.");
            sb.AppendLine("- Gợi ý mô tả dự án có nêu công nghệ sử dụng, vai trò, trách nhiệm,... không");

            sb.AppendLine("\n5. KHU VỰC KỸ NĂNG:");
            sb.AppendLine("- Đánh giá mức độ chi tiết và phù hợp của kỹ năng với vị trí công việc.");
            sb.AppendLine("- Kiểm tra kỹ năng có được liệt kê rõ ràng, phân loại và định dạng tốt không.");
            sb.AppendLine("- Gợi ý cách tổ chức và trình bày kỹ năng hiệu quả hơn.");

            sb.AppendLine("\n6. KHU VỰC CHỨNG CHỈ:");
            sb.AppendLine("- Đánh giá mức độ phù hợp của chứng chỉ với vị trí ứng tuyển.");
            sb.AppendLine("- Định dạng ngày: Chấp nhận MM/YYYY.");
            sb.AppendLine("- Chỉ gợi ý bổ sung ngày cấp khi không có thông tin Date.");
            sb.AppendLine("- Kiểm tra tên chứng chỉ có rõ ràng, từ tổ chức nào cấp không.");

            sb.AppendLine("\n7. KHU VỰC GIẢI THƯỞNG:");
            sb.AppendLine("- Đánh giá mức độ phù hợp của giải thưởng với vị trí ứng tuyển.");
            sb.AppendLine("- Định dạng ngày: Định dạng ngày: Chấp nhận MM/YYYY.");
            sb.AppendLine("- Kiểm tra mô tả có nêu rõ giải thưởng là gì, trong lĩnh vực nào, từ tổ chức nào không.");

            // PHẦN 4: ĐỊNH DẠNG JSON VÀ CÁC TRƯỜNG
            sb.AppendLine("\nTrả về kết quả dưới dạng JSON không có giải thích hay markdown bọc ngoài, chỉ JSON thuần túy với cấu trúc:");
            sb.AppendLine(@"
{
 ""areas"": [
   {
     ""area"": ""Tên khu vực"",
     ""score"": 10,
     ""description"": ""Mô tả chi tiết bằng text thuần, KHÔNG có HTML"",
     ""suggestion"": ""<ul><li>Gợi ý 1</li><li>Gợi ý 2</li></ul>"",
     ""example"": ""<p>Ví dụ minh họa với <strong>định dạng</strong> HTML</p>"",
     ""correction"": null
   }
 ]
}
");

            sb.AppendLine("Trong phần phản hồi:");
            sb.AppendLine("- Trường `description` PHẢI là văn bản thuần túy (text thường) KHÔNG chứa bất kỳ thẻ HTML nào.");
            sb.AppendLine("- Trường `suggestion` nên sử dụng danh sách HTML (<ul>, <li>) để liệt kê các gợi ý cải thiện.");
            sb.AppendLine("- Trường `example` nên chứa ví dụ cụ thể với định dạng HTML để minh họa.");
            sb.AppendLine("- Trường `correction` LUÔN là null vì bạn không kiểm tra lỗi chính tả.");

            // PHẦN 5: DỮ LIỆU CV
            sb.AppendLine("\nDữ liệu CV chuẩn hóa:");
            sb.AppendLine(normalizedJson);

            return sb.ToString();
        }

//        // Phương thức tạo prompt chỉ tập trung vào đánh giá CV
//        private string GenerateEvaluationPromptFromNormalized(string normalizedJson)
//        {
//            var sb = new StringBuilder();

//            // PHẦN 1: NHIỆM VỤ VÀ MỤC TIÊU CHÍNH
//            sb.AppendLine("!!! NHIỆM VỤ DUY NHẤT CỦA BẠN: ĐÁNH GIÁ CHẤT LƯỢNG CV !!!");
//            sb.AppendLine("Bạn CHÍNH XÁC là một chuyên gia nhân sự đánh giá CV. KHÔNG kiểm tra lỗi chính tả hay ngữ pháp.");
//            sb.AppendLine("Tập trung vào việc đánh giá nội dung, cấu trúc và sự phù hợp của CV với vị trí ứng tuyển.");
//            sb.AppendLine("");
//            sb.AppendLine("Với MỖI khu vực của CV (Thông tin, Giới thiệu, Kinh nghiệm, Kĩ năng, Học vấn, Dự án, Thành tích, Chứng chỉ, Giải thưởng), bạn PHẢI:");
//            sb.AppendLine("1. Đánh giá mức độ đầy đủ và phù hợp của thông tin");
//            sb.AppendLine("2. Đề xuất các cải thiện cụ thể để nâng cao chất lượng CV");
//            sb.AppendLine("3. Cung cấp ví dụ minh họa cho các cải thiện được đề xuất");
//            sb.AppendLine("4. Cho điểm từng khu vực (0-10) dựa trên mức độ hoàn thiện");

//            // PHẦN 2: TIÊU CHÍ ĐÁNH GIÁ
//            sb.AppendLine("\nTIÊU CHÍ ĐÁNH GIÁ:");
//            sb.AppendLine("1. Đầy đủ: Thông tin có đầy đủ và chi tiết không");
//            sb.AppendLine("2. Phù hợp: Thông tin có phù hợp với vị trí ứng tuyển không");
//            sb.AppendLine("3. Cụ thể: Thông tin có được trình bày cụ thể, rõ ràng không");
//            sb.AppendLine("4. Định dạng: Thông tin có được trình bày với định dạng phù hợp không");
//            sb.AppendLine("5. Tổ chức: Thông tin có được tổ chức logic, dễ theo dõi không");

//            // PHẦN 3: HƯỚNG DẪN ĐÁNH GIÁ TỪNG KHU VỰC
//            sb.AppendLine("\nHƯỚNG DẪN ĐÁNH GIÁ TỪNG KHU VỰC:");
            
//            sb.AppendLine("\n1. KHU VỰC THÔNG TIN:");
//            sb.AppendLine("- Kiểm tra đầy đủ thông tin cơ bản: họ tên, email, số điện thoại, địa chỉ, vị trí ứng tuyển.");
//            sb.AppendLine("- KHÔNG cần gợi ý bổ sung các liên kết như LinkedIn, GitHub cá nhân, trừ khi chúng đã có sẵn trong dữ liệu CV.");

//            sb.AppendLine("\n2. KHU VỰC KINH NGHIỆM:");
//            sb.AppendLine("- Đánh giá mức độ chi tiết và phù hợp của kinh nghiệm với vị trí ứng tuyển.");
//            sb.AppendLine("- Định dạng ngày tháng: Kiểm tra StartDate và EndDate có định dạng MM/YYYY.");
//            sb.AppendLine("- EndDate trống nhưng có CurrentlyWorking=true, hoặc EndDate là \"Hiện tại\" hay \"Present\" đều là định dạng hợp lệ.");
//            sb.AppendLine("- Chỉ gợi ý bổ sung thông tin thời gian khi hoàn toàn không có thông tin StartDate và EndDate và CurrentlyWorking=false.");

//            sb.AppendLine("\n3. KHU VỰC HỌC VẤN:");
//            sb.AppendLine("- Đánh giá mức độ chi tiết và phù hợp của học vấn với vị trí ứng tuyển.");
//            sb.AppendLine("- Định dạng ngày tháng: Kiểm tra StartDate và EndDate có định dạng MM/YYYY.");
//            sb.AppendLine("- Chỉ gợi ý bổ sung thông tin thời gian khi không có bất kỳ thông tin StartDate và EndDate nào.");
//            sb.AppendLine("- Kiểm tra có đầy đủ thông tin về tên trường");
//            sb.AppendLine("- Gợi ý nếu không có thông tin về ngành học, GPA,...");

//            sb.AppendLine("\n4. KHU VỰC DỰ ÁN:");
//            sb.AppendLine("- Đánh giá mức độ chi tiết và phù hợp của dự án với vị trí ứng tuyển.");
//            sb.AppendLine("- Định dạng ngày tháng: Kiểm tra StartDate và EndDate có định dạng MM/YYYY");
//            sb.AppendLine("- Chỉ gợi ý bổ sung ngày tháng khi không có thông tin thời gian nào.");
//            sb.AppendLine("- Gợi ý mô tả dự án có nêu công nghệ sử dụng, vai trò, trách nhiệm,... không");

//            sb.AppendLine("\n5. KHU VỰC KỸ NĂNG:");
//            sb.AppendLine("- Đánh giá mức độ chi tiết và phù hợp của kỹ năng với vị trí công việc.");
//            sb.AppendLine("- Kiểm tra kỹ năng có được liệt kê rõ ràng, phân loại và định dạng tốt không.");
//            sb.AppendLine("- Gợi ý cách tổ chức và trình bày kỹ năng hiệu quả hơn.");

//            sb.AppendLine("\n6. KHU VỰC CHỨNG CHỈ:");
//            sb.AppendLine("- Đánh giá mức độ phù hợp của chứng chỉ với vị trí ứng tuyển.");
//            sb.AppendLine("- Định dạng ngày: Chấp nhận MM/YYYY.");
//            sb.AppendLine("- Chỉ gợi ý bổ sung ngày cấp khi không có thông tin Date.");
//            sb.AppendLine("- Kiểm tra tên chứng chỉ có rõ ràng, từ tổ chức nào cấp không.");

//            sb.AppendLine("\n7. KHU VỰC GIẢI THƯỞNG:");
//            sb.AppendLine("- Đánh giá mức độ phù hợp của giải thưởng với vị trí ứng tuyển.");
//            sb.AppendLine("- Định dạng ngày: Định dạng ngày: Chấp nhận MM/YYYY.");
//            sb.AppendLine("- Kiểm tra mô tả có nêu rõ giải thưởng là gì, trong lĩnh vực nào, từ tổ chức nào không.");

//            // PHẦN 4: ĐỊNH DẠNG JSON VÀ CÁC TRƯỜNG
//            sb.AppendLine("\nTrả về kết quả dưới dạng JSON không có giải thích hay markdown bọc ngoài, chỉ JSON thuần túy với cấu trúc:");
//            sb.AppendLine(@"
//{
// ""areas"": [
//   {
//     ""area"": ""Tên khu vực"",
//     ""score"": 10,
//     ""description"": ""Mô tả chi tiết bằng text thuần, KHÔNG có HTML"",
//     ""suggestion"": ""<ul><li>Gợi ý 1</li><li>Gợi ý 2</li></ul>"",
//     ""example"": ""<p>Ví dụ minh họa với <strong>định dạng</strong> HTML</p>"",
//     ""correction"": null
//   }
// ]
//}
//");

//            sb.AppendLine("Trong phần phản hồi:");
//            sb.AppendLine("- Trường `description` PHẢI là văn bản thuần túy (text thường) KHÔNG chứa bất kỳ thẻ HTML nào.");
//            sb.AppendLine("- Trường `suggestion` nên sử dụng danh sách HTML (<ul>, <li>) để liệt kê các gợi ý cải thiện.");
//            sb.AppendLine("- Trường `example` nên chứa ví dụ cụ thể với định dạng HTML để minh họa.");
//            sb.AppendLine("- Trường `correction` LUÔN là null vì bạn không kiểm tra lỗi chính tả.");

//            // PHẦN 5: DỮ LIỆU CV
//            sb.AppendLine("\nDữ liệu CV chuẩn hóa:");
//            sb.AppendLine(normalizedJson);

//            return sb.ToString();
//        }

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
            sb.AppendLine("   - Overview: Tóm tắt về bản thân, mục tiêu nghề nghiệp (BẮT BUỘC trả về dưới dạng HTML với định dạng phù hợp như đoạn văn <p>, in đậm <strong>, in nghiêng <em>)");
            sb.AppendLine();
            sb.AppendLine("2. Experiences (kinh nghiệm làm việc): Liệt kê các kinh nghiệm làm việc dưới dạng mảng, mỗi phần tử có:");
            sb.AppendLine("   - Title: Tên công ty và vị trí");
            sb.AppendLine("   - Description: Mô tả công việc - BẮT BUỘC PHẢI CHỨA HTML để định dạng văn bản. KHÔNG DÙNG DẤU • mà phải dùng thẻ <ul><li> cho danh sách.");
            sb.AppendLine("     Ví dụ: \"<p>Làm việc tại dự án X với vai trò Y.</p><ul><li>Phát triển tính năng A</li><li>Thiết kế hệ thống B</li></ul>\"");
            sb.AppendLine("   - StartDate: Thời gian bắt đầu (tháng/năm hoặc năm)");
            sb.AppendLine("   - EndDate: Thời gian kết thúc (tháng/năm hoặc năm)");
            sb.AppendLine();
            sb.AppendLine("3. Education (học vấn): Liệt kê học vấn dưới dạng mảng, mỗi phần tử có:");
            sb.AppendLine("   - UniversityName: Tên trường");
            sb.AppendLine("   - Description: Thông tin về ngành học, điểm số, v.v. (BẮT BUỘC PHẢI CHỨA HTML, KHÔNG DÙNG DẤU • mà phải dùng thẻ <ul><li> cho danh sách)");
            sb.AppendLine("   - StartDate: Thời gian bắt đầu (năm)");
            sb.AppendLine("   - EndDate: Thời gian kết thúc (năm)");
            sb.AppendLine();
            sb.AppendLine("4. Projects (dự án): Liệt kê các dự án dưới dạng mảng, mỗi phần tử có:");
            sb.AppendLine("   - Title: Tên dự án");
            sb.AppendLine("   - Description: Mô tả dự án - BẮT BUỘC PHẢI CHỨA HTML, KHÔNG DÙNG DẤU • mà phải dùng thẻ <ul><li> cho danh sách các công nghệ và kỹ năng sử dụng");
            sb.AppendLine("     Ví dụ: \"<p>Dự án quản lý nhân sự.</p><ul><li>Sử dụng React cho frontend</li><li>Xây dựng API với ASP.NET Core</li></ul>\"");
            sb.AppendLine("   - StartDate: Thời gian bắt đầu (nếu có)");
            sb.AppendLine("   - EndDate: Thời gian kết thúc (nếu có)");
            sb.AppendLine();
            sb.AppendLine("5. Skills (kỹ năng):");
            sb.AppendLine("   - Description: Liệt kê các kỹ năng - BẮT BUỘC PHẢI CHỨA HTML, KHÔNG DÙNG DẤU • mà phải dùng thẻ <ul><li> cho danh sách kỹ năng");
            sb.AppendLine("     Ví dụ ĐÚNG: \"<ul><li><strong>Ngôn ngữ lập trình:</strong> JavaScript, TypeScript, C#</li><li><strong>Framework:</strong> React, Angular, ASP.NET Core</li></ul>\"");
            sb.AppendLine("     Ví dụ SAI: \"• Ngôn ngữ lập trình: JavaScript, TypeScript, C#\\n• Framework: React, Angular, ASP.NET Core\"");
            sb.AppendLine();
            sb.AppendLine("6. Certificates (chứng chỉ): Liệt kê các chứng chỉ dưới dạng mảng, mỗi phần tử có:");
            sb.AppendLine("   - Title: Tên chứng chỉ");
            sb.AppendLine("   - Date: Ngày cấp (nếu có)");
            sb.AppendLine("   - Description: Mô tả thêm (nếu có, BẮT BUỘC PHẢI CHỨA HTML, KHÔNG DÙNG DẤU • mà phải dùng thẻ <ul><li> cho danh sách)");
            sb.AppendLine();
            sb.AppendLine("7. Awards (giải thưởng): Liệt kê các giải thưởng dưới dạng mảng, mỗi phần tử có:");
            sb.AppendLine("   - Title: Tên giải thưởng");
            sb.AppendLine("   - Date: Ngày đạt được (nếu có)");
            sb.AppendLine("   - Description: Mô tả thêm (nếu có, BẮT BUỘC PHẢI CHỨA HTML, KHÔNG DÙNG DẤU • mà phải dùng thẻ <ul><li> cho danh sách)");
            sb.AppendLine();
            sb.AppendLine("8. Language (ngôn ngữ CV):");
            sb.AppendLine("   - Xác định CV này viết bằng ngôn ngữ gì. Trả về 'vi' nếu là tiếng Việt, 'en' nếu là tiếng Anh");
            sb.AppendLine();
            sb.AppendLine("HƯỚNG DẪN QUAN TRỌNG VỀ ĐỊNH DẠNG HTML:");
            sb.AppendLine("- LUÔN sử dụng thẻ <p> cho các đoạn văn, KHÔNG sử dụng văn bản thuần");
            sb.AppendLine("- LUÔN sử dụng thẻ <ul><li> cho danh sách, TUYỆT ĐỐI KHÔNG DÙNG DẤU • hoặc - hoặc * để liệt kê");
            sb.AppendLine("- Sử dụng thẻ <strong> cho văn bản in đậm, KHÔNG dùng **text**");
            sb.AppendLine("- Sử dụng thẻ <em> cho văn bản in nghiêng, KHÔNG dùng *text*");
            sb.AppendLine("- Sử dụng thẻ <br> cho ngắt dòng, KHÔNG dùng \\n");
            sb.AppendLine("- Đối với danh sách kỹ năng, hãy phân loại theo nhóm và sử dụng định dạng HTML đúng");
            sb.AppendLine();
            sb.AppendLine("VÍ DỤ VỀ MÔ TẢ KỸ NĂNG ĐÚNG:");
            sb.AppendLine("<ul>");
            sb.AppendLine("  <li><strong>Ngôn ngữ lập trình:</strong> JavaScript, TypeScript, C#</li>");
            sb.AppendLine("  <li><strong>Framework:</strong> React, Angular, ASP.NET Core</li>");
            sb.AppendLine("  <li><strong>Cơ sở dữ liệu:</strong> SQL Server, MongoDB</li>");
            sb.AppendLine("  <li><strong>Công cụ:</strong> Git, Docker, CI/CD</li>");
            sb.AppendLine("</ul>");
            sb.AppendLine();
            sb.AppendLine("VÍ DỤ VỀ MÔ TẢ KINH NGHIỆM ĐÚNG:");
            sb.AppendLine("<p>Làm việc tại Công ty ABC với vai trò Developer, phụ trách phát triển và bảo trì các ứng dụng web.</p>");
            sb.AppendLine("<ul>");
            sb.AppendLine("  <li>Phát triển frontend sử dụng React và TypeScript</li>");
            sb.AppendLine("  <li>Xây dựng API backend với ASP.NET Core</li>");
            sb.AppendLine("  <li>Tối ưu hóa hiệu suất hệ thống, giảm 30% thời gian tải trang</li>");
            sb.AppendLine("</ul>");
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
                        {
                            // Giữ nguyên định dạng HTML trong Overview
                            cvDto.PersonalInfo.Overview = overviewElement.GetString();
                        }
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
                            {
                                // Giữ nguyên định dạng HTML trong Description
                                experience.Description = descElement.GetString();
                            }

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
                            {
                                // Giữ nguyên định dạng HTML trong Description
                                education.Description = descElement.GetString();
                            }

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
                            {
                                // Giữ nguyên định dạng HTML trong Description
                                project.Description = descElement.GetString();
                            }

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
                            // Giữ nguyên định dạng HTML trong Description
                            cvDto.Skill.Description = descElement.GetString();
                        }
                        else if (skillsElement.ValueKind == JsonValueKind.Array)
                        {
                            // Nếu kỹ năng là một mảng, chuyển đổi thành danh sách HTML
                            StringBuilder skillBuilder = new StringBuilder();
                            skillBuilder.AppendLine("<ul>");
                            foreach (var skill in skillsElement.EnumerateArray())
                            {
                                if (skill.ValueKind == JsonValueKind.String)
                                    skillBuilder.AppendLine($"<li>{skill.GetString()}</li>");
                            }
                            skillBuilder.AppendLine("</ul>");
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
                                {
                                    // Giữ nguyên định dạng HTML trong Description
                                    certificate.Description = descElement.GetString();
                                }
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
                                {
                                    // Giữ nguyên định dạng HTML trong Description
                                    award.Description = descElement.GetString();
                                }
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

        // Add this helper method to the class
        private string StripHtml(string? input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return string.Empty;

            return Regex.Replace(input, "<.*?>", string.Empty);
        }

        // Phương thức gọi API Gemini
        private async Task<CVEvaluationResultDto> CallGeminiAPI(string prompt)
        {
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
                },
                generationConfig = new
                {
                    temperature = 0.1,        // Giá trị thấp để giảm tính ngẫu nhiên
                    maxOutputTokens = 8192,   // Đảm bảo đủ không gian cho đầu ra
                    stopSequences = new string[] { } // Không dừng lại giữa chừng
                },
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

        // Phương thức kết hợp kết quả từ hai lần gọi API
        private CVEvaluationResultDto CombineResults(CVEvaluationResultDto spellCheckResult, CVEvaluationResultDto evaluationResult)
        {
            var result = new CVEvaluationResultDto
            {
                Areas = new List<CVEvaluationAreaDto>()
            };

            // Tạo map từ kết quả kiểm tra chính tả để dễ tra cứu
            var spellCheckMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            
            if (spellCheckResult?.Areas != null)
            {
                foreach (var area in spellCheckResult.Areas)
                {
                    if (!string.IsNullOrEmpty(area.Area) && !string.IsNullOrEmpty(area.Correction))
                    {
                        spellCheckMap[area.Area] = area.Correction;
                    }
                }
            }

            // Nếu kết quả đánh giá không có, tạo kết quả từ kết quả kiểm tra chính tả
            if (evaluationResult?.Areas == null || !evaluationResult.Areas.Any())
            {
                if (spellCheckResult?.Areas != null)
                {
                    foreach (var area in spellCheckResult.Areas)
                    {
                        result.Areas.Add(new CVEvaluationAreaDto
                        {
                            Area = area.Area,
                            Score = 0,
                            Description = "Không có thông tin để đánh giá khu vực này.",
                            Suggestion = "<ul><li>Cần bổ sung thông tin cho khu vực này.</li></ul>",
                            Example = null,
                            Correction = area.Correction
                        });
                    }
                }
                return result;
            }

            // Kết hợp kết quả từ đánh giá và thêm các lỗi chính tả tương ứng
            foreach (var evalArea in evaluationResult.Areas)
            {
                var combinedArea = new CVEvaluationAreaDto
                {
                    Area = evalArea.Area,
                    Score = evalArea.Score,
                    Description = evalArea.Description ?? string.Empty,
                    Suggestion = evalArea.Suggestion ?? string.Empty,
                    Example = evalArea.Example,
                    Correction = null  // Mặc định không có lỗi chính tả
                };

                // Nếu có thông tin lỗi chính tả cho khu vực này, thêm vào
                if (!string.IsNullOrEmpty(evalArea.Area) && spellCheckMap.TryGetValue(evalArea.Area, out var correction))
                {
                    combinedArea.Correction = correction;
                }

                result.Areas.Add(combinedArea);
            }

            // Thêm các khu vực chỉ có trong kết quả kiểm tra chính tả nhưng không có trong kết quả đánh giá
            if (spellCheckResult?.Areas != null)
            {
                foreach (var spellArea in spellCheckResult.Areas)
                {
                    if (string.IsNullOrEmpty(spellArea.Area)) continue;
                    
                    if (!result.Areas.Any(a => string.Equals(a.Area, spellArea.Area, StringComparison.OrdinalIgnoreCase)))
                    {
                        result.Areas.Add(new CVEvaluationAreaDto
                        {
                            Area = spellArea.Area,
                            Score = 0,
                            Description = "Không có thông tin để đánh giá khu vực này.",
                            Suggestion = "<ul><li>Cần bổ sung thông tin cho khu vực này.</li></ul>",
                            Example = null,
                            Correction = spellArea.Correction
                        });
                    }
                }
            }

            return result;
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
            if (!text.StartsWith("{") && !text.StartsWith("["))
            {
                // Log nếu response không phải JSON hợp lệ
                Console.WriteLine($"Invalid JSON response: {text}");
                // Nếu response không phải JSON object hoặc array
                return text.Contains("[") && text.Contains("]") ? "[]" : "{}";
            }

            return text;
        }
    }


}