using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using iCV.Application.Common.DTOs;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace iCV.Application.ExternalServices.PdfCVImport.Commands.Import
{
    public class PdfCVImportCommand : IRequest<CVDto>
    {
        public IFormFile PdfFile { get; set; }
        public string? UserId { get; set; }
    }
}
