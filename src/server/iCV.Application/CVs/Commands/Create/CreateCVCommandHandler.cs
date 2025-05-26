using iCV.Application.Common.DTOs;
using iCV.Application.Common.Interfaces;
using iCV.Domain.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.CVs.Commands.Create
{
    public class CreateCVCommandHandler : IRequestHandler<CreateCVCommand, CVDto>, IApplicationMarker
    {
        private readonly IDocumentRepository _documentRepository;
        private readonly IPersonalInfoRepository _personalInfoRepository;
        private readonly IExperienceRepository _experienceRepository;
        private readonly IEducationRepository _educationRepository;
        private readonly ISkillsRepository _skillRepository;
        private readonly ICVRepository _cvRepository;

        public CreateCVCommandHandler(
            IDocumentRepository documentRepository,
            IPersonalInfoRepository personalInfoRepository,
            IExperienceRepository experienceRepository,
            IEducationRepository educationRepository,
            ISkillsRepository skillRepository,
            ICVRepository cvRepository
            )
        {
            _documentRepository = documentRepository;
            _personalInfoRepository = personalInfoRepository;
            _experienceRepository = experienceRepository;
            _educationRepository = educationRepository;
            _skillRepository = skillRepository;
            _cvRepository = cvRepository;
        }
        public async Task<CVDto> Handle(CreateCVCommand request, CancellationToken cancellationToken)
        {
            // Create document
            var document = new Domain.Entities.Document
            {
                userId = request.Document.userId,
                title = request.Document.title,
                summary = request.Document.summary,
                themeColor = request.Document.themeColor,
                thumbnail = request.Document.thumbnail,
                currentPosition = request.Document.currentPosition,
                authorName = request.Document.authorName,
                authorEmail = request.Document.authorEmail
            };
            await _documentRepository.CreateDocumentAsync(document);

            if (request.PersonalInfo != null)
            {
                await _personalInfoRepository.CreatePersonalInfoAsync(
                    new PersonalInfo
                    {
                        documentId = document.id,
                        firstName = request.PersonalInfo.firstName,
                        lastName = request.PersonalInfo.lastName,
                        email = request.PersonalInfo.email,
                        phone = request.PersonalInfo.phone,
                        address = request.PersonalInfo.address
                    }
                );
            }

            if (request.Experiences != null)
            {
                foreach (var experience in request.Experiences)
                {
                    await _experienceRepository.CreateExperienceAsync(
                        new Experience
                        {
                            documentId = document.id,
                            title = experience.title,
                            position = experience.position,
                            currentlyWorking = experience.currentlyWorking,
                            startDate = experience.startDate,
                            endDate = experience.endDate
                        }
                    );
                }
            }

            if (request.Educations != null)
            {
                foreach (var education in request.Educations)
                {
                    await _educationRepository.CreateEducationAsync(
                        new Education
                        {
                            documentId = document.id,
                            universityName = education.universityName,
                            degree = education.degree,
                            major = education.major,
                            startDate = education.startDate,
                            endDate = education.endDate
                        }
                    );
                }
            }

            if (request.Skills != null)
            {
                foreach (var skill in request.Skills)
                {
                    await _skillRepository.CreateSkillsAsync(
                        new Skills
                        {
                            documentId = document.id,
                            name = skill.name,
                            main = skill.main
                        }
                    );
                }
            }

            var cv = await _cvRepository.GetCVByDocumentIdAsync(document.id);
            return cv ?? throw new InvalidOperationException("Failed to create CV. Document not found.");
        }
    }
}
