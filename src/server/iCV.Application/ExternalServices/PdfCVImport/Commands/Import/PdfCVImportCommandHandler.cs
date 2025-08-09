using iCV.Application.Common.DTOs;
using iCV.Application.Common.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace iCV.Application.ExternalServices.PdfCVImport.Commands.Import
{
    public class PdfCVImportCommandHandler : IRequestHandler<PdfCVImportCommand, CVDto>, IApplicationMarker
    {
        private readonly IPdfCVImportService _pdfCVImportService;

        public PdfCVImportCommandHandler(IPdfCVImportService pdfCVImportService)
        {
            _pdfCVImportService = pdfCVImportService;
        }

        public async Task<CVDto> Handle(PdfCVImportCommand request, CancellationToken cancellationToken)
        {
            if (request.PdfFile == null || request.PdfFile.Length == 0)
            {
                throw new ArgumentException("File không hợp lệ");
            }

            if (!request.PdfFile.ContentType.Equals("application/pdf"))
            {
                throw new ArgumentException("Chỉ hỗ trợ file PDF");
            }

            if (string.IsNullOrEmpty(request.UserId))
            {
                throw new ArgumentException("UserId không được để trống");
            }

            // Sử dụng PdfCVImportService để xử lý và lưu CV
            var cvDto = await _pdfCVImportService.ImportPdfCVAsync(request.PdfFile, request.UserId);
            
            return cvDto;
        }
    }
}