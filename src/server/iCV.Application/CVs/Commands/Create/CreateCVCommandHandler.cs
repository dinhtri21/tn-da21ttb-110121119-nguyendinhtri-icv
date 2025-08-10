using AutoMapper;
using iCV.Application.Common.DTOs;
using iCV.Application.Common.Interfaces;
using iCV.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Net.Mime.MediaTypeNames;

namespace iCV.Application.CVs.Commands.Create
{
    public class UpdateCVCommandHandler : IRequestHandler<CreateCVCommand, CVDto>, IApplicationMarker
    {
        private readonly ICVRepository _cvRepository;
        private readonly IMapper _mapper;

        public UpdateCVCommandHandler(ICVRepository cvRepository, IMapper mapper)
        {
            _mapper = mapper;
            _cvRepository = cvRepository;
           
        }
        public async Task<CVDto> Handle(CreateCVCommand request, CancellationToken cancellationToken)
        {
           
            //Create CV
            var cv = new CV
            {
                UserId = request.UserId,
                FileName = request.FileName,
                Status = request.Status ?? "Private",
                CreateWhen = request.CreateWhen,
                PersonalInfo = request.PersonalInfo,
                Template = request.Template,
                Avatar = request.Avatar,
                Awards = request.Awards,
                Certificates = request.Certificates,
                Projects = request.Projects,
                Education = request.Education,
                Experiences = request.Experiences,
                Skill = request.Skill
            };
            await _cvRepository.CreateCVAsync(cv);

            var cvRes = await _cvRepository.GetCVByIdAsync(cv.Id);

            var cvDtoRes = _mapper.Map<CVDto>(cvRes);
            return cvDtoRes;
        }
    }
}
