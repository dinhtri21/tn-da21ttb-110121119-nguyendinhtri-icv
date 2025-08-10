using iCV.Application.Common.DTOs;
using iCV.Application.Common.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace iCV.Application.CVs.Queries.GetPublicCVById
{
    public class GetPublicCVByIdQueryHandler : IRequestHandler<GetPublicCVByIdQuery, CVDto?>, IApplicationMarker
    {
        private readonly ICVRepository _cvRepository;

        public GetPublicCVByIdQueryHandler(ICVRepository cvRepository)
        {
            _cvRepository = cvRepository;
        }

        public async Task<CVDto?> Handle(GetPublicCVByIdQuery request, CancellationToken cancellationToken)
        {
            var cv = await _cvRepository.GetCVByIdAsync(request.Id);
            
            // Kiểm tra nếu CV tồn tại và có status là "public"
            if (cv != null && cv.Status == "public")
            {
                // Chuyển từ entity sang DTO
                var cvDto = new CVDto
                {
                    Id = cv.Id,
                    UserId = cv.UserId,
                    FileName = cv.FileName,
                    Status = cv.Status,
                    CreateWhen = cv.CreateWhen,
                    Template = cv.Template,
                    PersonalInfo = cv.PersonalInfo,
                    Experiences = cv.Experiences,
                    Education = cv.Education,
                    Projects = cv.Projects,
                    Awards = cv.Awards,
                    Certificates = cv.Certificates,
                    Skill = cv.Skill,
                    Avatar = cv.Avatar
                };
                
                return cvDto;
            }
            
            // Trả về null nếu CV không tồn tại hoặc không phải status "public"
            return null;
        }
    }
}