using iCV.Application.Common.DTOs;
using iCV.Application.Common.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace iCV.Application.CVs.Commands.Translate
{
    public class TranslateCVCommandHandler : IRequestHandler<TranslateCVCommand, CVDto>, IApplicationMarker
    {
        private readonly ICVRepository _cvRepository;
        private readonly ICVTranslationService _translationService;

        public TranslateCVCommandHandler(
            ICVRepository cvRepository,
            ICVTranslationService translationService)
        {
            _cvRepository = cvRepository;
            _translationService = translationService;
        }

        public async Task<CVDto> Handle(TranslateCVCommand request, CancellationToken cancellationToken)
        {
            // Lấy CV từ repository
            var cv = await _cvRepository.GetCVByIdAsync(request.Id);
            
            if (cv == null)
            {
                throw new Exception("CV không tồn tại");
            }

            // Kiểm tra quyền - người dùng chỉ có thể dịch CV của họ
            if (cv.UserId != request.UserId)
            {
                throw new Exception("Bạn không có quyền dịch CV này");
            }

            // Chuyển từ entity sang DTO
            var cvDto = new CVDto
            {
                Id = cv.Id,
                UserId = cv.UserId,
                FileName = cv.FileName,
                CreateWhen = cv.CreateWhen,
                PersonalInfo = cv.PersonalInfo,
                Experiences = cv.Experiences,
                Education = cv.Education,
                Projects = cv.Projects,
                Awards = cv.Awards,
                Certificates = cv.Certificates,
                Skill = cv.Skill,
                Template = cv.Template,
                Avatar = cv.Avatar
            };

            // Dịch CV
            var translatedCvDto = await _translationService.TranslateCVAsync(cvDto, request.TargetLanguage);

            // Lưu CV đã dịch vào database
            cv.PersonalInfo = translatedCvDto.PersonalInfo;
            cv.Experiences = translatedCvDto.Experiences;
            cv.Education = translatedCvDto.Education;
            cv.Projects = translatedCvDto.Projects;
            cv.Awards = translatedCvDto.Awards;
            cv.Certificates = translatedCvDto.Certificates;
            cv.Skill = translatedCvDto.Skill;
            cv.Template.Language = request.TargetLanguage;

            await _cvRepository.UpdateCVAsync(cv);

            // Trả về DTO đã dịch
            return translatedCvDto;
        }
    }
}