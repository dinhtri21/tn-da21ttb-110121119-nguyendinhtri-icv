using iCV.Application.Common.DTOs;
using System.Threading.Tasks;

namespace iCV.Application.Common.Interfaces
{
    public interface ICVTranslationService
    {
        Task<CVDto> TranslateCVAsync(CVDto cv, string targetLanguage);
    }
}