using iCV.Application.Common.DTOs;
using iCV.Application.Common.Interfaces;
using iCV.Domain.Entities;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;
using System.Text;
using System.Text.RegularExpressions;
using System.Linq;
using System.Text.Json;

namespace iCV.Infrastructure.Services.CVImportService
{
    public class PdfCVImportService : IPdfCVImportService
    {
        private readonly ICVRepository _cvRepository;
        private readonly IGeminiEvaluationService _geminiService;

        public PdfCVImportService(
            ICVRepository cvRepository,
            IGeminiEvaluationService geminiService)
        {
            _cvRepository = cvRepository;
            _geminiService = geminiService;
        }

        public async Task<CVDto> ImportPdfCVAsync(IFormFile pdfFile, string userId)
        {
            // Kiểm tra file
            if (pdfFile == null || pdfFile.Length == 0)
            {
                throw new ArgumentException("File không hợp lệ");
            }

            if (!pdfFile.ContentType.Equals("application/pdf"))
            {
                throw new ArgumentException("Chỉ hỗ trợ file PDF");
            }

            // Lưu tên file gốc để sử dụng
            string fileName = $"{Guid.NewGuid()}_{Path.GetFileName(pdfFile.FileName)}";

            // Đọc nội dung PDF trực tiếp từ stream
            string pdfText = await ExtractTextFromPdfStreamAsync(pdfFile);

            // Khởi tạo CVDto cơ bản với ít thông tin nhất có thể
            var emptyCV = new CVDto
            {
                UserId = userId,
                FileName = fileName,
                CreateWhen = DateTime.UtcNow,
                Status = "Private",

                Template = new Template 
                {
                    Color = "#a5c9e8",
                    LeftSizeColum = 35,
                    RightSizeColum = 65,
                    LeftColumn = new List<Block>
                    {
                        new Block { Id = 0, Type = "avatar", Height = null },
                        new Block { Id = 1, Type = "overview", Height = null },
                        new Block { Id = 2, Type = "education", Height = null },
                        new Block { Id = 3, Type = "skills", Height = null },
                        new Block { Id = 4, Type = "certificate", Height = null },
                        new Block { Id = 5, Type = "award", Height = null }
                    },
                    RightColumn = new List<Block>
                    {
                        new Block { Id = 0, Type = "businessCard", Height = null },
                        new Block { Id = 1, Type = "personalInfo", Height = null },
                        new Block { Id = 2, Type = "spacer", Height = 20 },
                        new Block { Id = 3, Type = "experience", Height = null },
                        new Block { Id = 4, Type = "project", Height = null }
                    }
                },
                PersonalInfo = new PersonalInfo(),
                Experiences = new List<Experience>(),
                Education = new List<Education>(),
                Projects = new List<Project>(),
                Awards = new List<Award>(),
                Certificates = new List<Certificate>(),
                Skill = new Skill(),
            };

            try
            {
                // Gửi toàn bộ cấu trúc CV và nội dung PDF đến Gemini để xử lý
                var cvDto = await _geminiService.ExtractCVDataFromPdfTextAsync(emptyCV, pdfText);

                // Lưu CV vào database
                var cv = MapDtoToEntity(cvDto);
                await _cvRepository.CreateCVAsync(cv);

                // Cập nhật Id từ database
                cvDto.Id = cv.Id;

                return cvDto;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi xử lý CV: {ex.Message}");
                throw new Exception("Không thể xử lý file CV", ex);
            }
        }

        private async Task<string> ExtractTextFromPdfStreamAsync(IFormFile pdfFile)
        {
            var textBuilder = new StringBuilder();

            using (var stream = pdfFile.OpenReadStream())
            {
                using (PdfDocument document = PdfDocument.Open(stream))
                {
                    foreach (Page page in document.GetPages())
                    {
                        string pageText = page.Text;
                        textBuilder.AppendLine(pageText);
                    }
                }
            }

            return textBuilder.ToString();
        }

        private CV MapDtoToEntity(CVDto cvDto)
        {
            return new CV
            {
                UserId = cvDto.UserId,
                FileName = cvDto.FileName,
                CreateWhen = cvDto.CreateWhen ?? DateTime.UtcNow,
                PersonalInfo = cvDto.PersonalInfo,
                Experiences = cvDto.Experiences,
                Education = cvDto.Education,
                Projects = cvDto.Projects,
                Awards = cvDto.Awards,
                Certificates = cvDto.Certificates,
                Skill = cvDto.Skill,
                Template = cvDto.Template,
                Avatar = cvDto.Avatar
            };
        }
    }
}