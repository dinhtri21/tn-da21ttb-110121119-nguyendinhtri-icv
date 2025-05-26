using iCV.Application.Common.DTOs;
using iCV.Application.Common.Interfaces;
using iCV.Domain.Entities;
using iCV.Infrastructure.Context;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Infrastructure.Repositories
{
    public class CVRepository : ICVRepository
    {
        private readonly IMongoCollection<Document> _documents;
        private readonly IMongoCollection<PersonalInfo> _personalInfos;
        private readonly IMongoCollection<Skills> _skills;
        private readonly IMongoCollection<Experience> _experiences;
        private readonly IMongoCollection<Education> _educations;
        public CVRepository(MongoDbContext context)
        {
            _documents = context.Documents;
            _personalInfos = context.PersonalInfos;
            _skills = context.Skills;
            _experiences = context.Experiences;
            _educations = context.Educations;
        }

        public async Task<CVDto?> GetCVByDocumentIdAsync(string id)
        {
            var document = await _documents.Find(d => d.id == id).FirstOrDefaultAsync();
            if (document == null) return null;

            var personalInfo = await _personalInfos.Find(p => p.documentId == id).FirstOrDefaultAsync();
            var skills = await _skills.Find(s => s.documentId == id).ToListAsync();
            var experiences = await _experiences.Find(e => e.documentId == id).ToListAsync();
            var educations = await _educations.Find(e => e.documentId == id).ToListAsync();

            return new CVDto
            {
                Document = MapDocumentToDto(document),
                PersonalInfo = MapPersonalInfoToDto(personalInfo),
                Skills = skills.Select(MapSkillToDto).ToList(),
                Experiences = experiences.Select(MapExperienceToDto).ToList(),
                Educations = educations.Select(MapEducationToDto).ToList()
            };
        }

        private DocumentDto MapDocumentToDto(Document doc) => new DocumentDto
        {
            id = doc.id,
            userId = doc.userId,
            title = doc.title,
            summary = doc.summary,
            themeColor = doc.themeColor,
            thumbnail = doc.thumbnail,
            currentPosition = doc.currentPosition,
            authorName = doc.authorName,
            authorEmail = doc.authorEmail,
            createdAt = doc.createdAt,
            updatedAt = doc.updatedAt
        };

        private PersonalInfoDto MapPersonalInfoToDto(PersonalInfo p) => new PersonalInfoDto
        {
            id = p.id,
            documentId = p.documentId,
            firstName = p.firstName,
            lastName = p.lastName,
            jobTitle = p.jobTitle,
            email = p.email,
            phone = p.phone,
            address = p.address
        };

        private SkillsDto MapSkillToDto(Skills s) => new SkillsDto
        {
            id = s.id,
            name = s.name,
            documentId = s.documentId,
            main = s.main
        };

        private ExperienceDto MapExperienceToDto(Experience e) => new ExperienceDto
        {
            id = e.id,
            documentId = e.documentId,
            title = e.title,
            position = e.position,
            startDate = e.startDate,
            endDate = e.endDate,
        };

        private EducationDto MapEducationToDto(Education e) => new EducationDto
        {
            id = e.id,
            documentId = e.documentId,
            universityName = e.universityName,
            degree = e.degree,
            major = e.major,
            startDate = e.startDate,
            endDate = e.endDate
        };
    }
}
