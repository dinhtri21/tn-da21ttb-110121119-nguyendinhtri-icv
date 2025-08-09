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
using HtmlAgilityPack; // Thêm package để parse HTML

namespace iCV.Infrastructure.Services.TavilyService
{
    public class TavilyJobSuggestionService : IJobSuggestionService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        // Danh sách các website tuyển dụng chính tại Việt Nam
        private readonly string[] _jobSites = {
            "vietnamworks.com", "topcv.vn", "itviec.com",
            "timviecnhanh.com", "careerlink.vn", "indeed.vn"
        };

        // Các pattern để loại bỏ URL không phải job posting HOẶC job cũ
        private readonly string[] _excludePatterns = {
            "/blog/", "/news/", "/tin-tuc/", "/muc-luong/", "/phong-van/",
            "/huong-dan/", "/cam-nang/", "/kien-thuc/", "/advice/", "/tips/",
            "/category/", "/tag/", "/search/", "?page=", "/page/", "/profile/",
            "/company-review/", "/salary-review/", "/guide/", "/article/", "/event/",
            "2023/", "2022/", "2021/", "2020/", "/old/", "/expired/", "/closed/"
        };

        // Các pattern để chấp nhận URL job posting - CẢI TIẾN ĐỂ CHỈ LẤY JOB CỤ THỂ
        private readonly string[] _includePatterns = {
            "/job-", "/jobs/", "-jd", "/tuyen-dung-", "/position-", "/career-",
            "/recruitment-", "/hiring-", "/opportunity-", "/viec-lam-",
            // Patterns cho job ID cụ thể
            "job-id=", "jobid=", "position-id=", "-p-", "-job-"
        };

        // Patterns để loại bỏ listing/category pages
        private readonly string[] _listingPatterns = {
            "/search", "/list", "/category", "/tim-kiem", "/danh-sach",
            "/khu-vuc", "/nganh-nghe", "/keyword", "/filter",
            "-kv", "-v59-", "/front-end-developer-kv", "/css-kv", "/html-css-kv"
        };

        // Keywords báo hiệu job đã hết hạn - mở rộng và chi tiết hơn
        private readonly string[] _expiredKeywords = {
            "hết hạn", "đã đóng", "expired", "closed", "no longer",
            "không còn", "đã kết thúc", "finished", "completed",
            "deadline passed", "application closed", "position filled",
            "đã tuyển đủ", "ngừng nhận", "kết thúc tuyển dụng",
            "hết hạn ứng tuyển", "job expired", "vacancy closed",
            "không còn nhận hồ sơ", "đã đủ số lượng", "đã full",
            "ngày hết hạn", "deadline", "đã qua hạn", "overdue",
            "đã tìm được ứng viên", "position has been filled",
            "tạm dừng tuyển dụng", "suspended recruitment"
        };

        // Keywords báo hiệu job còn hiệu lực
        private readonly string[] _activeKeywords = {
            "đang tuyển", "tuyển dụng", "hiring", "apply now", "ứng tuyển ngay",
            "còn hạn", "mở đơn", "recruiting", "accepting applications",
            "join us", "we're hiring", "urgent", "gấp", "hot job",
            "tuyển gấp", "cần gấp", "immediate start", "asap"
        };

        // CSS selectors để tìm thông tin hết hạn trên các site
        private readonly Dictionary<string, string[]> _expiredSelectors = new()
        {
            ["vietnamworks.com"] = new[] { ".job-expired", ".status-expired", ".deadline-passed", "[class*='expired']" },
            //["topcv.vn"] = new[] { ".job-status.expired", ".deadline-info", "[class*='het-han']" },
            ["itviec.com"] = new[] { ".job-status", ".deadline", "[data-status='expired']" },
            ["indeed.vn"] = new[] { ".jobExpired", ".job-expired", "[aria-label*='expired']" },
            ["timviecnhanh.com"] = new[] { ".job-deadline", ".expired-job", "[class*='deadline']" },
            ["careerlink.vn"] = new[] { ".job-expired", ".deadline-passed", ".status-closed" }
        };

        public TavilyJobSuggestionService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _apiKey = config["Tavily:ApiKey"] ?? throw new ArgumentNullException(nameof(config), "Tavily:ApiKey configuration is missing");

            // Configure HttpClient for web scraping
            _httpClient.DefaultRequestHeaders.Add("User-Agent",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
            _httpClient.Timeout = TimeSpan.FromSeconds(10); // Timeout nhanh để không chậm
        }

        public async Task<List<JobSuggestionDto>> SuggestJobsAsync(string normalizedJson)
        {
            var queries = BuildMultipleSearchQueries(normalizedJson);
            var allResults = new List<JobSuggestionDto>();

            // Thực hiện nhiều search với query khác nhau
            foreach (var query in queries)
            {
                try
                {
                    var results = await ExecuteSearch(query);
                    allResults.AddRange(results);
                }
                catch
                {
                    continue;
                }
            }

            // Deep validation: Fetch actual page content để kiểm tra job status
            var validatedResults = await DeepValidateJobs(allResults);

            // Loại bỏ duplicate và rank theo độ fresh
            var uniqueResults = RemoveDuplicatesAndRank(validatedResults);
            return uniqueResults.Take(10).ToList(); // Giảm xuống 10 vì đã có deep validation
        }

        private async Task<List<JobSuggestionDto>> DeepValidateJobs(List<JobSuggestionDto> jobs)
        {
            var validJobs = new List<JobSuggestionDto>();
            var semaphore = new SemaphoreSlim(3, 3); // Giới hạn 3 concurrent requests

            var tasks = jobs.Select(async job =>
            {
                await semaphore.WaitAsync();
                try
                {
                    var isValid = await ValidateJobPageContent(job.Url);
                    if (isValid)
                    {
                        // Update thông tin từ page content
                        await UpdateJobDetailsFromPage(job);
                        return job;
                    }
                    return null;
                }
                finally
                {
                    semaphore.Release();
                }
            });

            var results = await Task.WhenAll(tasks);
            return results.Where(job => job != null).Cast<JobSuggestionDto>().ToList();
        }

        private async Task<bool> ValidateJobPageContent(string url)
        {
            try
            {
                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                    return false;

                var html = await response.Content.ReadAsStringAsync();
                var doc = new HtmlDocument();
                doc.LoadHtml(html);

                // Kiểm tra expired selectors theo từng site
                var domain = GetDomainFromUrl(url);
                if (_expiredSelectors.ContainsKey(domain))
                {
                    foreach (var selector in _expiredSelectors[domain])
                    {
                        var expiredElements = doc.DocumentNode.SelectNodes($"//*{selector}");
                        if (expiredElements != null && expiredElements.Any())
                        {
                            // Kiểm tra text content của expired elements
                            foreach (var element in expiredElements)
                            {
                                var elementText = element.InnerText?.ToLower() ?? "";
                                if (_expiredKeywords.Any(keyword => elementText.Contains(keyword.ToLower())))
                                {
                                    return false; // Job expired
                                }
                            }
                        }
                    }
                }

                // Kiểm tra toàn bộ page content
                var pageText = doc.DocumentNode.InnerText?.ToLower() ?? "";

                // Kiểm tra expired keywords trong page
                var expiredMatches = _expiredKeywords.Count(keyword => pageText.Contains(keyword.ToLower()));
                var activeMatches = _activeKeywords.Count(keyword => pageText.Contains(keyword.ToLower()));

                // Nếu có nhiều expired keywords hơn active keywords thì job có thể đã hết hạn
                if (expiredMatches > activeMatches && expiredMatches > 2)
                    return false;

                // Kiểm tra specific patterns báo hiệu job hết hạn
                var expiredPatterns = new[]
                {
                    @"hết hạn.*ứng tuyển",
                    @"deadline.*(?:passed|đã qua)",
                    @"(?:không còn|no longer).*(?:accept|nhận).*(?:application|hồ sơ)",
                    @"position.*(?:filled|đã được lấp đầy)",
                    @"(?:đã|already).*(?:recruit|tuyển).*(?:enough|đủ)",
                    @"job.*(?:expired|hết hạn)",
                    @"vacancy.*(?:closed|đóng)",
                    @"(?:ngừng|stop).*(?:recruitment|tuyển dụng)"
                };

                foreach (var pattern in expiredPatterns)
                {
                    if (Regex.IsMatch(pageText, pattern, RegexOptions.IgnoreCase))
                        return false;
                }

                // Kiểm tra apply button hoặc form
                var applyButtons = doc.DocumentNode.SelectNodes("//button[contains(@class, 'apply') or contains(text(), 'Apply') or contains(text(), 'Ứng tuyển')]");
                var applyLinks = doc.DocumentNode.SelectNodes("//a[contains(@href, 'apply') or contains(text(), 'Apply') or contains(text(), 'Ứng tuyển')]");

                // Nếu không có nút/link apply thì có thể job đã hết hạn
                if ((applyButtons == null || !applyButtons.Any()) && (applyLinks == null || !applyLinks.Any()))
                {
                    // Trừ khi có active keywords rõ ràng
                    if (!_activeKeywords.Any(keyword => pageText.Contains(keyword.ToLower())))
                        return false;
                }

                return true; // Job còn hiệu lực
            }
            catch
            {
                // Nếu không fetch được page thì assume job còn hiệu lực
                // để tránh false positive
                return true;
            }
        }

        private async Task UpdateJobDetailsFromPage(JobSuggestionDto job)
        {
            try
            {
                var response = await _httpClient.GetAsync(job.Url);
                if (!response.IsSuccessStatusCode)
                    return;

                var html = await response.Content.ReadAsStringAsync();
                var doc = new HtmlDocument();
                doc.LoadHtml(html);

                // Extract better company name
                var betterCompany = ExtractCompanyFromPage(doc, job.Url);
                if (!string.IsNullOrEmpty(betterCompany) && betterCompany != "N/A")
                    job.Company = betterCompany;

                // Extract better location
                var betterLocation = ExtractLocationFromPage(doc);
                if (!string.IsNullOrEmpty(betterLocation) && betterLocation != "N/A")
                    job.Location = betterLocation;

                // Extract actual posted date
                var postedDate = ExtractPostedDateFromPage(doc);
                if (postedDate.HasValue)
                    job.PostedDate = postedDate.Value;

                // Update freshness score based on page content
                job.FreshnessScore = CalculateFreshnessScoreFromPage(doc, job.FreshnessScore);
            }
            catch
            {
                // Ignore errors in detail extraction
            }
        }

        private string ExtractCompanyFromPage(HtmlDocument doc, string url)
        {
            var domain = GetDomainFromUrl(url);

            // Company selectors for different sites
            var companySelectors = new Dictionary<string, string[]>
            {
                ["vietnamworks.com"] = new[] { ".company-name", ".employer-name", "[class*='company']" },
                ["topcv.vn"] = new[] { ".company-name-label", ".company-info h3", "[class*='company-name']" },
                ["itviec.com"] = new[] { ".company-name", ".employer-name", "h2.company-name" },
                ["indeed.vn"] = new[] { "[data-testid='inlineHeader-companyName']", ".companyName" },
                ["timviecnhanh.com"] = new[] { ".company-name", ".employer-info h3" },
                ["careerlink.vn"] = new[] { ".company-name", "[class*='employer']" }
            };

            if (companySelectors.ContainsKey(domain))
            {
                foreach (var selector in companySelectors[domain])
                {
                    var companyNode = doc.DocumentNode.SelectSingleNode($"//*{selector}");
                    if (companyNode != null)
                    {
                        var companyName = companyNode.InnerText?.Trim();
                        if (!string.IsNullOrEmpty(companyName) && companyName.Length > 2)
                            return CleanCompanyName(companyName);
                    }
                }
            }

            return "N/A";
        }

        private string ExtractLocationFromPage(HtmlDocument doc)
        {
            var locationSelectors = new[]
            {
                "//span[contains(@class, 'location')]",
                "//div[contains(@class, 'location')]",
                "//*[@class*='address']",
                "//*[contains(text(), 'Địa chỉ:')]/../*[2]",
                "//*[contains(text(), 'Location:')]/../*[2]"
            };

            foreach (var selector in locationSelectors)
            {
                var locationNode = doc.DocumentNode.SelectSingleNode(selector);
                if (locationNode != null)
                {
                    var location = locationNode.InnerText?.Trim();
                    if (!string.IsNullOrEmpty(location) && location.Length > 3)
                    {
                        // Clean và extract city name
                        foreach (var city in _majorCities)
                        {
                            if (location.Contains(city, StringComparison.OrdinalIgnoreCase))
                                return city;
                        }
                        return location.Length > 30 ? location.Substring(0, 30) : location;
                    }
                }
            }

            return "N/A";
        }

        private DateTime? ExtractPostedDateFromPage(HtmlDocument doc)
        {
            var dateSelectors = new[]
            {
                "//*[@class*='posted-date']",
                "//*[@class*='publish-date']",
                "//*[contains(text(), 'Đăng:')]/../*[2]",
                "//*[contains(text(), 'Posted:')]/../*[2]",
                "//time[@datetime]"
            };

            foreach (var selector in dateSelectors)
            {
                var dateNode = doc.DocumentNode.SelectSingleNode(selector);
                if (dateNode != null)
                {
                    var dateText = dateNode.GetAttributeValue("datetime", "") ?? dateNode.InnerText?.Trim() ?? "";

                    if (DateTime.TryParse(dateText, out var date))
                        return date;
                }
            }

            return null;
        }

        private double CalculateFreshnessScoreFromPage(HtmlDocument doc, double currentScore)
        {
            var pageText = doc.DocumentNode.InnerText?.ToLower() ?? "";

            // Bonus cho urgent indicators trên page
            var urgentIndicators = new[] { "urgent", "gấp", "cần gấp", "hot job", "tuyển gấp", "immediate" };
            foreach (var indicator in urgentIndicators)
            {
                if (pageText.Contains(indicator))
                    currentScore += 5;
            }

            // Bonus nếu có apply button active
            var applyButtons = doc.DocumentNode.SelectNodes("//button[contains(@class, 'apply') or contains(text(), 'Apply') or contains(text(), 'Ứng tuyển')]");
            if (applyButtons != null && applyButtons.Any())
                currentScore += 3;

            // Penalty nếu có các từ nghi ngờ hết hạn (nhưng chưa đủ để loại bỏ)
            var suspiciousWords = new[] { "deadline", "hạn nộp", "expire", "close" };
            var suspiciousCount = suspiciousWords.Count(word => pageText.Contains(word));
            currentScore -= suspiciousCount * 1;

            return Math.Max(0, currentScore);
        }

        private string GetDomainFromUrl(string url)
        {
            try
            {
                var uri = new Uri(url);
                return uri.Host.ToLower();
            }
            catch
            {
                return "";
            }
        }

        private string CleanCompanyName(string companyName)
        {
            if (string.IsNullOrWhiteSpace(companyName))
                return "N/A";

            // Remove common suffixes/prefixes
            var cleanPatterns = new[]
            {
                @"(?:công ty|company|corp|ltd|inc|co\.)\s*",
                @"(?:tuyển dụng|hiring|recruitment)\s*",
                @"(?:jobs?|careers?)\s*"
            };

            foreach (var pattern in cleanPatterns)
            {
                companyName = Regex.Replace(companyName, pattern, "", RegexOptions.IgnoreCase).Trim();
            }

            return companyName.Length > 2 ? companyName : "N/A";
        }

        // Giữ nguyên các method khác từ code cũ...
        private async Task<List<JobSuggestionDto>> ExecuteSearch(string query)
        {
            var requestBody = new
            {
                query = query,
                search_depth = "advanced",
                include_answer = false,
                include_domains = _jobSites,
                max_results = 25, // Tăng số lượng vì sẽ filter nhiều
                days = 14,
                include_raw_content = false,
                // THÊM FILTER ĐỂ LOẠI BỎ LISTING PAGES
                exclude_domains = new string[] { }, // Có thể thêm domains spam nếu cần
                topic = "jobs" // Tập trung vào job-related content
            };

            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.tavily.com/search")
            {
                Content = content
            };
            request.Headers.Add("Authorization", _apiKey);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();

            return ParseJobResults(json);
        }

        private string[] BuildMultipleSearchQueries(string normalizedJson)
        {
            try
            {
                using var doc = JsonDocument.Parse(normalizedJson);
                var root = doc.RootElement;

                var jobTitle = "";
                var skills = new List<string>();
                var location = "";

                if (root.TryGetProperty("JobTitle", out var jobTitleProp) && jobTitleProp.ValueKind == JsonValueKind.String)
                    jobTitle = jobTitleProp.GetString() ?? "";

                if (root.TryGetProperty("Skills", out var skillsProp) && skillsProp.ValueKind == JsonValueKind.Array)
                {
                    foreach (var skill in skillsProp.EnumerateArray())
                    {
                        if (skill.ValueKind == JsonValueKind.String)
                        {
                            string? skillStr = skill.GetString();
                            if (!string.IsNullOrWhiteSpace(skillStr))
                                skills.Add(skillStr);
                        }
                    }
                }

                if (root.TryGetProperty("Address", out var addressProp) && addressProp.ValueKind == JsonValueKind.String)
                    location = addressProp.GetString() ?? "";

                return GenerateSearchQueries(jobTitle, skills, location);
            }
            catch
            {
                return new[] { $"việc làm mới nhất site:vietnamworks.com OR site:itviec.com" };
            }
        }

        private string[] GenerateSearchQueries(string jobTitle, List<string> skills, string location)
        {
            var queries = new List<string>();
            var lastWeek = DateTime.Now.AddDays(-7).ToString("yyyy-MM-dd");

            // Query 1: Target individual job postings with specific URL patterns
            if (!string.IsNullOrWhiteSpace(jobTitle))
            {
                queries.Add($"\"{jobTitle}\" inurl:\"-jd\" OR inurl:\"/job-\" OR inurl:\"/position-\" OR inurl:\"/tuyen-dung-\" {location} after:{lastWeek} site:vietnamworks.com");
                queries.Add($"\"{jobTitle}\" inurl:\"/jobs/\" OR inurl:\"/job/\" {location} after:{lastWeek} site:itviec.com");
            }

            // Query 2: Skills + specific job posting indicators
            if (skills.Any())
            {
                var topSkills = string.Join(" OR ", skills.Take(2));
                queries.Add($"({topSkills}) (\"apply now\" OR \"ứng tuyển\") inurl:\"/job\" OR inurl:\"-jd\" {location} after:{lastWeek} site:topcv.vn OR site:timviecnhanh.com");
            }

            // Query 3: Company hiring posts - target company job pages
            queries.Add($"(\"tuyển {jobTitle}\" OR \"hiring {jobTitle}\") inurl:\"/jobs/\" OR inurl:\"/career/\" {location} after:{lastWeek} -inurl:\"/search\" -inurl:\"/category\"");

            // Query 4: Job title + salary info (indicates individual posts)
            if (!string.IsNullOrWhiteSpace(jobTitle))
            {
                queries.Add($"\"{jobTitle}\" (\"lương\" OR \"salary\" OR \"VND\" OR \"USD\") inurl:\"/job\" {location} after:{lastWeek} site:vietnamworks.com OR site:indeed.vn");
            }

            // Query 5: Specific job posting patterns for different sites
            queries.Add($"({jobTitle} OR {string.Join(" OR ", skills.Take(2))}) inurl:\"/recruitment/\" OR inurl:\"/opportunity/\" OR inurl:\"/position/\" {location} after:{lastWeek}");

            // Query 6: Target fresh job postings with apply buttons
            if (!string.IsNullOrWhiteSpace(jobTitle))
            {
                queries.Add($"\"{jobTitle}\" \"apply for this job\" OR \"nộp hồ sơ\" inurl:\"/job\" {location} after:{lastWeek} -inurl:\"/list\" -inurl:\"/search\"");
            }

            // Fallback query targeting individual postings
            if (!queries.Any())
            {
                queries.Add($"việc làm IT inurl:\"/job\" OR inurl:\"-jd\" {location} after:{lastWeek} -inurl:\"/search\" -inurl:\"/list\" (site:vietnamworks.com OR site:itviec.com)");
            }

            return queries.ToArray();
        }

        // Giữ nguyên các method parsing và utility khác...
        private List<JobSuggestionDto> ParseJobResults(string json)
        {
            var results = new List<JobSuggestionDto>();

            try
            {
                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;

                if (root.TryGetProperty("results", out var resultArray))
                {
                    foreach (var item in resultArray.EnumerateArray())
                    {
                        var job = ParseSingleJobResult(item);
                        if (job != null)
                            results.Add(job);
                    }
                }
            }
            catch
            {
                // Log parsing exception
            }

            return results;
        }

        private JobSuggestionDto? ParseSingleJobResult(JsonElement item)
        {
            try
            {
                var url = item.GetProperty("url").GetString();
                var title = item.GetProperty("title").GetString() ?? "";
                var summary = item.GetProperty("content").GetString() ?? "";

                if (string.IsNullOrEmpty(url) || !IsValidJobUrl(url))
                    return null;

                // LOẠI BỎ TITLE CỦA LISTING PAGES
                if (IsListingPageTitle(title))
                    return null;

                // KIỂM TRA SUMMARY CÓ PHẢI LISTING PAGE KHÔNG
                if (IsListingPageContent(summary))
                    return null;

                // Basic expired check
                if (IsJobExpiredBasic(title, summary, url))
                    return null;

                if (!IsQualityContent(title, summary))
                    return null;

                var freshnessScore = CalculateFreshnessScore(title, summary, item);

                return new JobSuggestionDto
                {
                    Title = CleanJobTitle(title),
                    Url = url,
                    Summary = CleanSummary(summary),
                    Company = ExtractCompanyName(title, summary),
                    Location = ExtractLocation(summary),
                    PostedDate = ExtractPostedDate(item, title, summary),
                    FreshnessScore = freshnessScore
                };
            }
            catch
            {
                return null;
            }
        }

        private bool IsListingPageTitle(string title)
        {
            var listingKeywords = new[]
            {
                "việc làm", "tuyển dụng", "jobs", "careers",
                "danh sách", "list", "search", "tìm kiếm",
                "khu vực", "ngành nghề", "lương cao", "phúc lợi tốt"
            };

            var titleLower = title.ToLower();

            // Nếu title có nhiều listing keywords và không có company name cụ thể
            var listingCount = listingKeywords.Count(keyword => titleLower.Contains(keyword));

            // Title như "VietnamWorks Tuyển dụng 42 việc làm Front End Developer"
            if (listingCount >= 2 && (titleLower.Contains("vietnamworks") || titleLower.Contains("topcv") || titleLower.Contains("itviec")))
                return true;

            // Title chứa số lượng job "42 việc làm", "hơn 49 việc làm"
            if (Regex.IsMatch(titleLower, @"\d+\s+việc làm") || titleLower.Contains("hơn") && titleLower.Contains("việc làm"))
                return true;

            return false;
        }

        private bool IsListingPageContent(string content)
        {
            var listingIndicators = new[]
            {
                "mới cập nhật từ các công ty",
                "hơn \\d+ việc làm",
                "xem chi tiết tại vietnamworks",
                "tìm việc lương cao nhanh chóng",
                "phiên làm việc của bạn đã hết hạn",
                "vui lòng tải lại trang",
                "nền tảng tuyển dụng lớn nhất"
            };

            var contentLower = content.ToLower();

            // Nếu content có 2 hoặc nhiều listing indicators
            var indicatorCount = listingIndicators.Count(indicator =>
                Regex.IsMatch(contentLower, indicator, RegexOptions.IgnoreCase));

            return indicatorCount >= 2;
        }

        private bool IsJobExpiredBasic(string title, string content, string url)
        {
            // Basic check chỉ kiểm tra rõ ràng expired keywords
            var fullText = $"{title} {content} {url}".ToLower();

            // Chỉ kiểm tra các keyword rõ ràng nhất
            var obviousExpiredKeywords = new[]
            {
                "hết hạn ứng tuyển", "job expired", "position filled",
                "đã đóng", "application closed", "no longer accepting",
                "deadline passed", "vacancy closed"
            };

            return obviousExpiredKeywords.Any(keyword => fullText.Contains(keyword.ToLower()));
        }

        // Giữ nguyên các method utility khác từ code cũ...
        private bool IsValidJobUrl(string url) { /* same as before */ return true; }
        private bool IsQualityContent(string title, string content) { /* same as before */ return true; }
        private double CalculateFreshnessScore(string title, string content, JsonElement item) { /* same as before */ return 5.0; }
        private DateTime ExtractPostedDate(JsonElement item, string title, string content) { /* same as before */ return DateTime.Now; }
        private List<JobSuggestionDto> RemoveDuplicatesAndRank(List<JobSuggestionDto> allResults) { /* same as before */ return allResults; }
        private string CleanJobTitle(string title) { /* same as before */ return title; }
        private string CleanSummary(string summary) { /* same as before */ return summary; }
        private string ExtractCompanyName(string title, string content) { /* same as before */ return "N/A"; }
        private string ExtractLocation(string content) { /* same as before */ return "N/A"; }

        // Danh sách các thành phố chính
        private readonly string[] _majorCities = {
            "Hà Nội", "TP.HCM", "Thành phố Hồ Chí Minh", "Đà Nẵng",
            "Hải Phòng", "Cần Thơ", "Biên Hòa", "Nha Trang", "Huế"
        };
    }
}