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

            // SECTION 1: MAIN TASK AND OBJECTIVES
            sb.AppendLine("YOU ARE an AI assistant tasked with normalizing CV data into a structured JSON format.");
            sb.AppendLine("Please standardize the CV data below into JSON with these fields: FullName, JobTitle, Address, Email, Phone, Overview, Experiences (list), Projects (list), Educations (list), Skills (list), Awards (list), Certificates (list), CareerObjective, Achievements (list).");
            sb.AppendLine("Remove HTML, consolidate scattered information, and separate fields if they are embedded within descriptions.");
            sb.AppendLine("Return ONLY pure JSON without explanations, markdown formatting, or backtick enclosures.");

            // CRITICAL ADDITION: Instruction to preserve Vietnamese content
            sb.AppendLine("\nCRITICAL INSTRUCTION: DO NOT translate any Vietnamese content to English. Preserve all original language and terminology.");

            // SECTION 2: CV DATA
            sb.AppendLine("\nCV data to normalize:");
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

            // SECTION 1: MAIN TASK AND OBJECTIVES
            sb.AppendLine("YOUR ONLY TASK: CHECK FOR SPELLING, GRAMMAR, AND EXPRESSION ERRORS IN THE CV");
            sb.AppendLine("You ARE EXACTLY a language expert specializing in checking spelling and grammar. DO NOT perform any other content evaluation.");
            sb.AppendLine("You have extensive knowledge of both Vietnamese and English, especially technical terms in information technology.");
            sb.AppendLine("");
            sb.AppendLine("For EACH area of the CV (Thông tin, Giới thiệu, Kinh nghiệm, Kĩ năng, Học vấn, Dự án, Thành tích, Chứng chỉ, Giải thưởng), you ONLY do ONE thing:");
            sb.AppendLine("- THOROUGHLY check for Vietnamese/English spelling errors, grammar, vocabulary, and unnatural expressions.");
            sb.AppendLine("- CLEARLY record these errors in the 'correction' field of the corresponding area.");
            sb.AppendLine("- If there are TRULY no errors, set the 'correction' field to null.");

            // SECTION 2: SPELL-CHECKING PROCESS
            sb.AppendLine("\nSPELL-CHECKING PROCESS:");
            sb.AppendLine("1. Carefully read each sentence in the CV and check each word.");
            sb.AppendLine("2. Pay special attention to technical terms, technology names, company names.");
            sb.AppendLine("3. Check punctuation and spacing between words.");
            sb.AppendLine("4. Check consistency in writing (e.g., JavaScript vs Javascript).");
            sb.AppendLine("5. Check words that are incorrectly joined together (e.g., côngnghệ, lậptrình, triểnkhai).");

            // SECTION 3: LIST OF COMMON ERRORS
            sb.AppendLine("\nCOMMON ERRORS TO CHECK:");
            sb.AppendLine("- Vietnamese spelling errors: missing accents, wrong accents, misspellings (e.g., nghên cứu, phát triễn, trien khai)");
            sb.AppendLine("- English spelling errors: misspellings (e.g., Deverloper, Font-end, Javascipt, experence)");
            sb.AppendLine("- Technology term errors: incorrectly written technology names (e.g., React Js, Node JS, Vue js instead of ReactJS, Node.js, Vue.js)");
            sb.AppendLine("- Capitalization errors: not capitalizing proper names, technology names (e.g., javascript instead of JavaScript)");
            sb.AppendLine("- Spacing errors: missing or extra spaces (e.g., ReactNative instead of React Native)");
            sb.AppendLine("- Word joining errors: words incorrectly joined together (e.g., côngnghệ, kỹnăng, lậptrình, ngônngữ, full-stackdeveloper)");
            sb.AppendLine("- Consistency errors: using different spellings for the same term");
            sb.AppendLine("- Common misspellings: font-end/front-end, back-end/back end, full-stack/fullstack, javascrip/javascript");
            sb.AppendLine("- Or any other errors you may encounter");

            // SECTION 4: CORRECTION FORMAT
            sb.AppendLine("\nCORRECTION FORMAT MUST BE EXACTLY AS FOLLOWS:");
            sb.AppendLine("<p><span style=\"color: red;\">phát triễn</span> => <span style=\"color: green;\">phát triển</span></p>");
            sb.AppendLine("<p><span style=\"color: red;\">Deverloper</span> => <span style=\"color: green;\">Developer</span></p>");
            sb.AppendLine("<p><span style=\"color: red;\">trien khai</span> => <span style=\"color: green;\">triển khai</span></p>");
            sb.AppendLine("<p><span style=\"color: red;\">triểnkhai</span> => <span style=\"color: green;\">triển khai</span></p>");
            sb.AppendLine("<p><span style=\"color: red;\">javascript</span> => <span style=\"color: green;\">JavaScript</span></p>");
            sb.AppendLine("<p><span style=\"color: red;\">react js</span> => <span style=\"color: green;\">React.js</span></p>");
            sb.AppendLine("<p><span style=\"color: red;\">côngnghệ</span> => <span style=\"color: green;\">công nghệ</span></p>");

            // SECTION 5: INSTRUCTIONS FOR MULTIPLE ERRORS
            sb.AppendLine("\nIF THERE ARE MULTIPLE ERRORS, LIST EACH ERROR IN A SEPARATE <p> TAG:");
            sb.AppendLine("<p><span style=\"color: red;\">phát triễn</span> => <span style=\"color: green;\">phát triển</span></p>");
            sb.AppendLine("<p><span style=\"color: red;\">kinh ngiệm</span> => <span style=\"color: green;\">kinh nghiệm</span></p>");
            sb.AppendLine("<p><span style=\"color: red;\">triểm khai</span> => <span style=\"color: green;\">triển khai</span></p>");

            // SECTION 6: DETAILED CHECK FOR EACH AREA
            sb.AppendLine("\nDETAILED CHECK FOR EACH AREA:");
            sb.AppendLine("1. Thông tin: Check for spelling errors in full name, address, job position, email, phone number.");
            sb.AppendLine("2. Kinh nghiệm: Check for spelling errors in Title and Description.");
            sb.AppendLine("3. Học vấn: Check for spelling errors in UniversityName and Description.");
            sb.AppendLine("4. Dự án: Check for spelling errors in Title and Description. (Note that there may be multiple projects)");
            sb.AppendLine("5. Kỹ năng: Check for spelling errors in skill descriptions, especially names of technologies and programming languages.");
            sb.AppendLine("6. Chứng chỉ: Check for spelling errors in Title and Description.");
            sb.AppendLine("7. Giải thưởng: Check for spelling errors in Title and Description.");

            // SECTION 7: JSON FORMAT AND FIELDS
            sb.AppendLine("\nReturn the result as pure JSON without explanation or markdown wrapping, just pure JSON with this structure:");
            sb.AppendLine(@"
{
 ""areas"": [
   {
     ""area"": ""Tên khu vực"",
     ""score"": 0,
     ""description"": """",
     ""suggestion"": """",
     ""example"": """",
     ""correction"": ""<p><span style=\""color: red;\"">phát triễn</span> => <span style=\""color: green;\"">phát triển</span></p>""
   }
 ]
}
");
            sb.AppendLine("Note: Only fill in the 'correction' field, leave other fields empty or with default values. Score should always be 0.");
            sb.AppendLine("The 'correction' field MUST use <p> and <span> tags with style attributes for colors to display errors and corrections.");
            sb.AppendLine("Important note: Avoid reporting errors when there aren't any (Example: ReactJS => ReactJS, học hỏi => học hỏi)");
            sb.AppendLine("Important note: Do not check for spelling errors in areas that have no data");

            // SECTION 8: CV DATA
            sb.AppendLine("\nNormalized CV data:");
            sb.AppendLine(normalizedJson);

            return sb.ToString();
        }

        // Phương thức tạo prompt chỉ tập trung vào đánh giá CV
        private string GenerateEvaluationPromptFromNormalized(string normalizedJson)
        {
            var sb = new StringBuilder();

            // SECTION 1: MAIN TASK AND OBJECTIVES
            sb.AppendLine("YOUR ONLY TASK: EVALUATE CV QUALITY");
            sb.AppendLine("You ARE EXACTLY a human resources expert who evaluates CVs. DO NOT check for spelling or grammar errors.");
            sb.AppendLine("Focus on evaluating content, structure, and relevance of the CV to the job position.");
            sb.AppendLine("");
            sb.AppendLine("For EACH area of the CV (Thông tin, Giới thiệu, Kinh nghiệm, Kĩ năng, Học vấn, Dự án, Thành tích, Chứng chỉ, Giải thưởng), you MUST:");
            sb.AppendLine("1. Evaluate the completeness and relevance of the information");
            sb.AppendLine("2. Evaluate how well the information aligns with the job position");
            sb.AppendLine("3. Suggest specific improvements to enhance the CV quality");
            sb.AppendLine("4. Provide examples illustrating the suggested improvements");
            sb.AppendLine("5. Score each area (0-10) based on completeness - if an area has no information, score it 0");

            // SECTION 2: EVALUATION CRITERIA
            sb.AppendLine("\nEVALUATION CRITERIA:");
            sb.AppendLine("1. Completeness: Is the information comprehensive and detailed?");
            sb.AppendLine("2. Relevance: Is the information relevant to the job position?");
            sb.AppendLine("3. Specificity: Is the information presented clearly and specifically?");
            sb.AppendLine("4. Formatting: Is the information presented with appropriate formatting?");
            sb.AppendLine("5. Organization: Is the information organized logically and easy to follow?");

            // SECTION 3: AREA-SPECIFIC EVALUATION GUIDELINES
            sb.AppendLine("\nAREA-SPECIFIC EVALUATION GUIDELINES:");

            sb.AppendLine("\n1. THÔNG TIN AREA:");
            sb.AppendLine("- Check for complete basic information: full name, email, phone number, address, job position.");
            sb.AppendLine("- DO NOT suggest adding links like LinkedIn or GitHub profiles unless they already exist in the CV data.");

            sb.AppendLine("\n2. GIỚI THIỆU AREA:");
            sb.AppendLine("- Check if introduction information is provided");
            sb.AppendLine("- Example suggestion: ");
            sb.AppendLine("+ Clearly state short-term and long-term goals related to the job position.");

            sb.AppendLine("\n3. KINH NGHIỆM AREA:");
            sb.AppendLine("- Compare work experience with job description requirements");
            sb.AppendLine("- Evaluate relevance of experience to the position");
            sb.AppendLine("- Identify gaps between current experience and job requirements");
            sb.AppendLine("- Evaluate level of detail and relevance of experience to the job position.");
            sb.AppendLine("- No need to check start or end dates");
            sb.AppendLine("- Example suggestion: ");
            sb.AppendLine("+ Quantify achievements during employment (if applicable)");

            sb.AppendLine("\n4. HỌC VẤN AREA:");
            sb.AppendLine("- Evaluate relevance of education to job requirements.");
            sb.AppendLine("- Consider if the field of study relates to the job position.");
            sb.AppendLine("- Check for complete information about school name, field of study, and study period.");
            sb.AppendLine("- No need to check start or end dates.");
            sb.AppendLine("- Check for complete information about school name");
            sb.AppendLine("- Suggest if information about field of study, GPA, club membership, etc. is missing.");
            sb.AppendLine("- Example: Add GPA information (if available)");

            sb.AppendLine("\n5. DỰ ÁN AREA:");
            sb.AppendLine("- Evaluate relevance of projects to the job position.");
            sb.AppendLine("- Analyze whether skills and technologies used in projects align with job requirements");
            sb.AppendLine("- Evaluate detail level of project descriptions and the candidate's role.");
            sb.AppendLine("- No need to check start or end dates");
            sb.AppendLine("- Suggest if project descriptions mention technologies used, role, responsibilities, etc.");
            sb.AppendLine("- Example suggestion: ");
            sb.AppendLine("+  Add information about project outcomes.");

            sb.AppendLine("\n6. KỸ NĂNG AREA:");
            sb.AppendLine("- Compare detailed skills in CV with skills required in job description");
            sb.AppendLine("- Analyze skills that meet requirements and skills that are missing");
            sb.AppendLine("- Suggest ways to add or highlight skills relevant to the job description");
            sb.AppendLine("- Check if skills are clearly listed, categorized, and well-formatted.");
            sb.AppendLine("- Suggest how to organize and present skills more effectively.");
            sb.AppendLine("- Example suggestion: ");
            sb.AppendLine("+ Group skills by Frontend, Backend, Tools");

            sb.AppendLine("\n7. CHỨNG CHỈ AREA:");
            sb.AppendLine("- Evaluate relevance of certificates to job requirements.");
            sb.AppendLine("- Determine if certificates provide an advantage for this position");
            sb.AppendLine("- Check if certificate names are clear and the issuing organization is mentioned.");

            sb.AppendLine("\n8. GIẢI THƯỞNG AREA:");
            sb.AppendLine("- Evaluate relevance of awards to the job position.");
            sb.AppendLine("- No need to check start or end dates");
            sb.AppendLine("- Check if descriptions clearly state what the award is, in which field, and from which organization.");

            // SECTION 4: JSON FORMAT AND FIELD INSTRUCTIONS
            sb.AppendLine("\nReturn results as pure JSON without explanation or markdown wrapping, just pure JSON with this structure:");
            sb.AppendLine(@"
{
 ""areas"": [
   {
     ""area"": ""Tên khu vực"",
     ""score"": 10,
     ""description"": ""Mô tả chi tiết bằng text thuần, KHÔNG có HTML"",
     ""suggestion"": ""<ul><li>Gợi ý 1</li><li>Gợi ý 2</li></ul>"",
     ""example"": ""<ul><li>Nội dung ví dụ 1</li><li>Nội dung ví dụ 2</li></ul>"",
     ""correction"": null
   }
 ]
}
");

            sb.AppendLine("Important note for your response:");
            sb.AppendLine("- The `description` field MUST be plain text (regular text) with NO HTML tags. Content should be concise, focused on main points");
            sb.AppendLine("- The `suggestion` field should use HTML lists (<ul>, <li>) to enumerate improvement suggestions. Content should be concise, focused on main points");
            sb.AppendLine("- The `example` field should contain specific examples with HTML formatting. Content should be concise, listed format. Remove 'Example:' from the beginning of each example.");
            sb.AppendLine("- The `correction` field should ALWAYS be null because you're not checking for spelling errors.");

            // CRITICAL ADDITION: Instruction to respond in Vietnamese
            sb.AppendLine("\nCRITICAL INSTRUCTION: You MUST provide ALL content in Vietnamese language ONLY!");
            sb.AppendLine("- ALL area names must remain in Vietnamese as shown above (Thông tin, Giới thiệu, etc.)");
            sb.AppendLine("- ALL descriptions must be written in Vietnamese");
            sb.AppendLine("- ALL suggestions must be written in Vietnamese");
            sb.AppendLine("- ALL examples must be written in Vietnamese");
            sb.AppendLine("- Despite receiving instructions in English, your ENTIRE response must be in Vietnamese");

            // SECTION 5: CV DATA
            sb.AppendLine("\nNormalized CV data:");
            sb.AppendLine(normalizedJson);

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

            // SECTION 1: INTRODUCTION AND MAIN TASK
            sb.AppendLine("YOU ARE an AI expert in CV analysis. I've sent you text content from a PDF CV file.");
            sb.AppendLine("Please analyze this content and return a JSON with the following information:");
            sb.AppendLine();

            // SECTION 2: PERSONAL INFORMATION EXTRACTION
            sb.AppendLine("1. PersonalInfo (personal information):");
            sb.AppendLine("   - FullName: Candidate's full name");
            sb.AppendLine("   - JobTitle: Position/title the candidate is seeking");
            sb.AppendLine("   - Email: Email address");
            sb.AppendLine("   - Phone: Phone number");
            sb.AppendLine("   - Address: Address (if available)");
            sb.AppendLine("   - Overview: Summary about self, career goals (MUST be returned in HTML format with appropriate formatting like paragraphs <p>, bold <strong>, italic <em>)");
            sb.AppendLine();

            // SECTION 3: WORK EXPERIENCE EXTRACTION
            sb.AppendLine("2. Experiences (work experience): List work experiences as an array, each element having:");
            sb.AppendLine("   - Title: Company name and position");
            sb.AppendLine("   - Description: Job description - MUST CONTAIN HTML for text formatting. DO NOT USE • symbol but use <ul><li> tags for lists.");
            sb.AppendLine("     Example: \"<p>Worked on project X with role Y.</p><ul><li>Developed feature A</li><li>Designed system B</li></ul>\"");
            sb.AppendLine("   - StartDate: Start time (month/year or year)");
            sb.AppendLine("   - EndDate: End time (month/year or year)");
            sb.AppendLine();

            // SECTION 4: EDUCATION EXTRACTION
            sb.AppendLine("3. Education: List education as an array, each element having:");
            sb.AppendLine("   - UniversityName: School name");
            sb.AppendLine("   - Description: Information about major, grades, etc. (MUST CONTAIN HTML, DO NOT USE • symbol but use <ul><li> tags for lists)");
            sb.AppendLine("   - StartDate: Start time (year)");
            sb.AppendLine("   - EndDate: End time (year)");
            sb.AppendLine();

            // SECTION 5: PROJECTS EXTRACTION
            sb.AppendLine("4. Projects: List projects as an array, each element having:");
            sb.AppendLine("   - Title: Project name");
            sb.AppendLine("   - Description: Project description - MUST CONTAIN HTML, DO NOT USE • symbol but use <ul><li> tags for lists of technologies and skills used");
            sb.AppendLine("     Example: \"<p>Personnel management project.</p><ul><li>Used React for frontend</li><li>Built API with ASP.NET Core</li></ul>\"");
            sb.AppendLine("   - StartDate: Start time (if available)");
            sb.AppendLine("   - EndDate: End time (if available)");
            sb.AppendLine();

            // SECTION 6: SKILLS EXTRACTION
            sb.AppendLine("5. Skills:");
            sb.AppendLine("   - Description: List skills - MUST CONTAIN HTML, DO NOT USE • symbol but use <ul><li> tags for skill lists");
            sb.AppendLine("     CORRECT Example: \"<ul><li><strong>Programming languages:</strong> JavaScript, TypeScript, C#</li><li><strong>Frameworks:</strong> React, Angular, ASP.NET Core</li></ul>\"");
            sb.AppendLine("     INCORRECT Example: \"• Programming languages: JavaScript, TypeScript, C#\\n• Frameworks: React, Angular, ASP.NET Core\"");
            sb.AppendLine();

            // SECTION 7: CERTIFICATES EXTRACTION
            sb.AppendLine("6. Certificates: List certificates as an array, each element having:");
            sb.AppendLine("   - Title: Certificate name");
            sb.AppendLine("   - Date: Issue date (if available)");
            sb.AppendLine("   - Description: Additional description (if available, MUST CONTAIN HTML, DO NOT USE • symbol but use <ul><li> tags for lists)");
            sb.AppendLine();

            // SECTION 8: AWARDS EXTRACTION
            sb.AppendLine("7. Awards: List awards as an array, each element having:");
            sb.AppendLine("   - Title: Award name");
            sb.AppendLine("   - Date: Date received (if available)");
            sb.AppendLine("   - Description: Additional description (if available, MUST CONTAIN HTML, DO NOT USE • symbol but use <ul><li> tags for lists)");
            sb.AppendLine();

            // SECTION 9: LANGUAGE DETECTION
            sb.AppendLine("8. Language (CV language):");
            sb.AppendLine("   - Determine what language this CV is written in. Return 'vi' if Vietnamese, 'en' if English");
            sb.AppendLine();

            // SECTION 10: IMPORTANT HTML FORMATTING GUIDELINES
            sb.AppendLine("IMPORTANT HTML FORMATTING GUIDELINES:");
            sb.AppendLine("- ALWAYS use <p> tags for paragraphs, DO NOT use plain text");
            sb.AppendLine("- ALWAYS use <ul><li> tags for lists, ABSOLUTELY DO NOT USE • or - or * for listing");
            sb.AppendLine("- Use <strong> for bold text, DO NOT use **text**");
            sb.AppendLine("- Use <em> for italic text, DO NOT use *text*");
            sb.AppendLine("- Use <br> for line breaks, DO NOT use \\n");
            sb.AppendLine("- For skill lists, categorize by group and use proper HTML formatting");
            sb.AppendLine();

            // SECTION 11: EXAMPLES OF CORRECT FORMATTING
            sb.AppendLine("EXAMPLE OF CORRECT SKILLS DESCRIPTION:");
            sb.AppendLine("<ul>");
            sb.AppendLine("  <li><strong>Ngôn ngữ lập trình:</strong> JavaScript, TypeScript, C#</li>");
            sb.AppendLine("  <li><strong>Framework:</strong> React, Angular, ASP.NET Core</li>");
            sb.AppendLine("  <li><strong>Cơ sở dữ liệu:</strong> SQL Server, MongoDB</li>");
            sb.AppendLine("  <li><strong>Công cụ:</strong> Git, Docker, CI/CD</li>");
            sb.AppendLine("</ul>");
            sb.AppendLine();

            sb.AppendLine("EXAMPLE OF CORRECT EXPERIENCE DESCRIPTION:");
            sb.AppendLine("<p>Làm việc tại Công ty ABC với vai trò Developer, phụ trách phát triển và bảo trì các ứng dụng web.</p>");
            sb.AppendLine("<ul>");
            sb.AppendLine("  <li>Phát triển frontend sử dụng React và TypeScript</li>");
            sb.AppendLine("  <li>Xây dựng API backend với ASP.NET Core</li>");
            sb.AppendLine("  <li>Tối ưu hóa hiệu suất hệ thống, giảm 30% thời gian tải trang</li>");
            sb.AppendLine("</ul>");
            sb.AppendLine();

            // SECTION 12: FINAL INSTRUCTIONS AND LANGUAGE REQUIREMENT
            sb.AppendLine("Ensure data format is suitable for parsing into JSON. Return a complete JSON object with all fields above (if information is not found, leave blank or null).");

            // CRITICAL ADDITION: Instruction to respond in Vietnamese
            sb.AppendLine("\nCRITICAL INSTRUCTION: The extracted content MUST be in Vietnamese if the original CV is in Vietnamese.");
            sb.AppendLine("- DO NOT translate Vietnamese content to English");
            sb.AppendLine("- Preserve all original language terms and phrases");
            sb.AppendLine("- Field names in the JSON should follow the structure provided above");

            // SECTION 13: CV CONTENT
            sb.AppendLine("\nCV content from PDF:");
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

        public async Task<CVEvaluationResultDto> EvaluateCVWithJobDescriptionAsync(CVDto cv, string jobDescription)
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

                // Bước 4: Tạo prompt đánh giá CV từ dữ liệu đã chuẩn hóa và job description
                string evaluationPrompt = GenerateEvaluationWithJobDescriptionPrompt(normalizedJson, jobDescription);
                
                // Bước 5: Gọi API để đánh giá CV
                var evaluationResult = await CallGeminiAPI(evaluationPrompt);

                // Bước 6: Kết hợp kết quả từ hai lần gọi API
                var combinedResult = CombineResults(spellCheckResult, evaluationResult);

                return combinedResult;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"EvaluateCVWithJobDescriptionAsync error: {ex.Message}");
                return new CVEvaluationResultDto();
            }
        }

        // Phương thức tạo prompt đánh giá CV dựa trên job description
        private string GenerateEvaluationWithJobDescriptionPrompt(string normalizedJson, string jobDescription)
        {
            var sb = new StringBuilder();

            // SECTION 1: MAIN TASK AND OBJECTIVES
            sb.AppendLine("YOUR ONLY TASK: EVALUATE CV COMPATIBILITY WITH JOB DESCRIPTION");
            sb.AppendLine("You ARE EXACTLY a human resources expert who evaluates how well a CV matches specific job requirements. DO NOT check for spelling or grammar errors.");
            sb.AppendLine("Focus on evaluating how well the CV meets the specific requirements in the job description provided.");
            sb.AppendLine("");
            sb.AppendLine("For EACH area of the CV (Thông tin, Giới thiệu, Kinh nghiệm, Kĩ năng, Học vấn, Dự án, Thành tích, Chứng chỉ, Giải thưởng, Đánh giá tổng thể CV so với JD), you MUST:");
            sb.AppendLine("1. Evaluate how well the information matches the job description requirements");
            sb.AppendLine("2. Identify strengths and weaknesses compared to the JD");
            sb.AppendLine("3. Suggest specific improvements to increase compatibility with the JD");
            sb.AppendLine("4. Score each area (0-10) based on compatibility with the JD");
            sb.AppendLine("5. Provide examples illustrating the suggested improvements");

            // SECTION 2: EVALUATION CRITERIA
            sb.AppendLine("\nEVALUATION CRITERIA:");
            sb.AppendLine("1. Compatibility: Does the information match the requirements in the JD?");
            sb.AppendLine("2. Fulfillment: What percentage of the JD requirements does the CV fulfill?");
            sb.AppendLine("3. Relevant experience: Is the work experience relevant to the position in the JD?");
            sb.AppendLine("4. Matching skills: Do the candidate's skills match the skills required in the JD?");
            sb.AppendLine("5. Standout points: Does the candidate have any standout qualities especially suitable for this position?");
            sb.AppendLine("6. Completeness: Is the information comprehensive and detailed?");
            sb.AppendLine("7. Specificity: Is the information presented clearly and specifically?");
            sb.AppendLine("8. Formatting: Is the information presented with appropriate formatting?");
            sb.AppendLine("9. Organization: Is the information organized logically and easy to follow?");

            // SECTION 3: AREA-SPECIFIC EVALUATION GUIDELINES
            sb.AppendLine("\nAREA-SPECIFIC EVALUATION GUIDELINES:");

            sb.AppendLine("\n1. THÔNG TIN AREA:");
            sb.AppendLine("- Analyze how well the job position matches the JD");
            sb.AppendLine("- Evaluate if contact information is complete");
            sb.AppendLine("- If information is complete and the position is relevant to the JD, give 10 points with no improvements needed");
            sb.AppendLine("- Check for complete basic information: full name, email, phone number, address, job position");
            sb.AppendLine("- DO NOT suggest adding links like LinkedIn or GitHub profiles unless they already exist in the CV data");

            sb.AppendLine("\n2. GIỚI THIỆU AREA:");
            sb.AppendLine("- Check if introduction information is provided");
            sb.AppendLine("- Evaluate how clearly short-term and long-term goals related to the position are stated");
            sb.AppendLine("- Evaluate how well the introduction aligns with JD requirements");
            sb.AppendLine("- Example suggestion: ");
            sb.AppendLine("+ Focus career orientation on the specific field mentioned in the JD");

            sb.AppendLine("\n3. KINH NGHIỆM AREA:");
            sb.AppendLine("- Compare work experience with JD experience requirements");
            sb.AppendLine("- Evaluate relevance of experience to the position");
            sb.AppendLine("- Identify gaps between current experience and JD requirements");
            sb.AppendLine("- Evaluate detail level and relevance of experience to the position");
            sb.AppendLine("- No need to check start or end dates");
            sb.AppendLine("- Example suggestions: ");
            sb.AppendLine("+ Quantify achievements during employment (if applicable)");
            sb.AppendLine("+ Highlight experience in projects related to the field in the JD");

            sb.AppendLine("\n4. HỌC VẤN AREA:");
            sb.AppendLine("- Evaluate how well education matches JD requirements");
            sb.AppendLine("- Consider if the field of study relates to the job position");
            sb.AppendLine("- Check for complete information about school name and field of study");
            sb.AppendLine("- No need to check start or end dates");
            sb.AppendLine("- Suggest if information about field of study, GPA, club membership is missing");
            sb.AppendLine("- Example: Add GPA information (if available)");

            sb.AppendLine("\n5. DỰ ÁN AREA:");
            sb.AppendLine("- Evaluate how well projects relate to the position in the JD");
            sb.AppendLine("- Analyze whether skills and technologies used in projects align with JD requirements");
            sb.AppendLine("- Evaluate detail level of project descriptions and the candidate's role");
            sb.AppendLine("- No need to check start or end dates");
            sb.AppendLine("- Suggest if project descriptions should mention technologies, role, responsibilities");
            sb.AppendLine("- Example suggestion: Add information about project outcomes");

            sb.AppendLine("\n6. KỸ NĂNG AREA:");
            sb.AppendLine("- Compare detailed skills in CV with skills required in the JD");
            sb.AppendLine("- Analyze skills that meet requirements and skills that are missing");
            sb.AppendLine("- Suggest ways to add or highlight skills relevant to the JD");
            sb.AppendLine("- Check if skills are clearly listed, categorized, and well-formatted");
            sb.AppendLine("- Suggest how to organize and present skills more effectively");
            sb.AppendLine("- Example suggestion: Group skills by Frontend, Backend, Tools");

            sb.AppendLine("\n7. CHỨNG CHỈ AREA:");
            sb.AppendLine("- Evaluate relevance of certificates to JD requirements");
            sb.AppendLine("- Determine if certificates provide an advantage for this position");
            sb.AppendLine("- Check if certificate names are clear and the issuing organization is mentioned");
            sb.AppendLine("- No need to check start or end dates");

            sb.AppendLine("\n8. GIẢI THƯỞNG AREA:");
            sb.AppendLine("- Evaluate relevance of awards to the field in the JD");
            sb.AppendLine("- Determine if awards create a distinguishing factor for the candidate");
            sb.AppendLine("- Check if descriptions clearly state what the award is, in which field, and from which organization");
            sb.AppendLine("- No need to check start or end dates");

            sb.AppendLine("\n9. ĐÁNH GIÁ TỔNG THỂ CV SO VỚI JD AREA:");
            sb.AppendLine("- Evaluate overall compatibility of the CV with the JD");
            sb.AppendLine("- Identify main strengths and weaknesses");
            sb.AppendLine("- Provide an overall score from 0-10 on compatibility");
            sb.AppendLine("- Provide specific suggestions to increase compatibility with the JD");
            sb.AppendLine("- Summarize skills and experience most relevant to the JD");
            sb.AppendLine("- Assess what percentage of job requirements the candidate can meet");

            // SECTION 4: JSON FORMAT AND FIELD INSTRUCTIONS
            sb.AppendLine("\nReturn results as pure JSON without explanation or markdown wrapping, just pure JSON with this structure:");
            sb.AppendLine(@"
{
 ""areas"": [
   {
     ""area"": ""Tên khu vực"",
     ""score"": 10,
     ""description"": ""Mô tả chi tiết bằng text thuần, KHÔNG có HTML"",
     ""suggestion"": ""<ul><li>Gợi ý 1</li><li>Gợi ý 2</li></ul>"",
     ""example"": ""<ul><li>Nội dung ví dụ 1</li><li>Nội dung ví dụ 2</li></ul>"",
     ""correction"": null
   },
   {
     ""area"": ""Đánh giá tổng thể JD"",
     ""score"": 8,
     ""description"": ""Mô tả tổng quan về mức độ phù hợp với JD"",
     ""suggestion"": ""<ul><li>Gợi ý cải thiện để tăng khả năng phù hợp</li></ul>"",
     ""example"": null,
     ""correction"": null
   }
 ]
}
");

            // SECTION 5: CRITICAL LANGUAGE AND FORMAT INSTRUCTIONS
            sb.AppendLine("\nCRITICAL INSTRUCTIONS FOR YOUR RESPONSE:");
            sb.AppendLine("- The `description` field MUST be plain text with NO HTML tags. Content should be concise, focused on main points.");
            sb.AppendLine("- The `suggestion` field should use HTML lists (<ul>, <li>) to enumerate improvement suggestions. Content should be concise, focused on main points.");
            sb.AppendLine("- The `example` field should contain specific examples with HTML formatting. Content should be concise, in list format. Remove any 'Ví dụ:' prefix.");
            sb.AppendLine("- The `correction` field should ALWAYS be null because you're not checking for spelling errors.");
            sb.AppendLine("- You MUST include a \"Đánh giá tổng thể JD\" area at the end of the list, with an overall score and compatibility analysis.");

            // CRITICAL ADDITION: Instruction to respond in Vietnamese
            sb.AppendLine("\nCRITICAL LANGUAGE INSTRUCTION: You MUST provide ALL content in Vietnamese language ONLY!");
            sb.AppendLine("- ALL area names must remain in Vietnamese as shown above (Thông tin, Giới thiệu, etc.)");
            sb.AppendLine("- ALL descriptions must be written in Vietnamese");
            sb.AppendLine("- ALL suggestions must be written in Vietnamese");
            sb.AppendLine("- ALL examples must be written in Vietnamese");
            sb.AppendLine("- Despite receiving instructions in English, your ENTIRE response must be in Vietnamese");

            // SECTION 6: CV DATA AND JOB DESCRIPTION
            sb.AppendLine("\nNormalized CV data:");
            sb.AppendLine(normalizedJson);

            sb.AppendLine("\nJOB DESCRIPTION:");
            sb.AppendLine(jobDescription);

            return sb.ToString();
        }
    }


}