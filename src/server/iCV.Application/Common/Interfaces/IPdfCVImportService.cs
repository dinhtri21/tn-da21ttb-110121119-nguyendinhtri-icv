using iCV.Application.Common.DTOs;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace iCV.Application.Common.Interfaces
{
    public interface IPdfCVImportService
    {
        Task<CVDto> ImportPdfCVAsync(IFormFile pdfFile, string userId);
    }
}