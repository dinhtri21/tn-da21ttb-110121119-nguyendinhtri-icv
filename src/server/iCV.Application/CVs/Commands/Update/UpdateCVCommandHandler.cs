using AutoMapper;
using FluentValidation;
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

namespace iCV.Application.CVs.Commands.Update
{
    public class UpdateCVCommandHandler : IRequestHandler<UpdateCVCommand, CVDto>, IApplicationMarker
    {
        private readonly ICVRepository _cvRepository;
        private readonly IMapper _mapper;

        public UpdateCVCommandHandler(ICVRepository cvRepository, IMapper mapper)
        {
            _mapper = mapper;
            _cvRepository = cvRepository;
        }

        public async Task<CVDto> Handle(UpdateCVCommand request, CancellationToken cancellationToken)
        {
            var cv = new CV
            {
                Id = request.Id,
                UserId = request.UserId,
                FileName = request.FileName,
                Status = request.Status,
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

            var cvUpdate = await _cvRepository.UpdateCVAsync(cv);

            var cvDtoRes = _mapper.Map<CVDto>(cvUpdate);
            return cvDtoRes;
        }
    }
}
