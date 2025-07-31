using iCV.Application.Common.DTOs;
using iCV.Application.Common.Interfaces;
using iCV.Domain.Entities;
using iCV.Infrastructure.Context;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Infrastructure.Repositories
{
    public class CVRepository : ICVRepository
    {
        private readonly IMongoCollection<CV> _cv;
        public CVRepository(MongoDbContext context)
        {
            _cv = context.CV;
          
        }

        public async Task CreateCVAsync(CV cv)
        {
            await _cv.InsertOneAsync(cv);
        }

        public async Task<CV?> GetCVByIdAsync(string id)
        {
            var cv = await _cv.Find(d => d.Id == id).FirstOrDefaultAsync();
            return cv;
        }

        //private DocumentDto MapDocumentToDto(Document doc) => new DocumentDto
        //{
        //    id = doc.id,
        //    userId = doc.userId,
        //    title = doc.title,
        //    summary = doc.summary,
        //    themeColor = doc.themeColor,
        //    thumbnail = doc.thumbnail,
        //    currentPosition = doc.currentPosition,
        //    authorName = doc.authorName,
        //    authorEmail = doc.authorEmail,
        //    createdAt = doc.createdAt,
        //    updatedAt = doc.updatedAt
        //};

        //private PersonalInfoDto MapPersonalInfoToDto(PersonalInfo p) => new PersonalInfoDto
        //{
        //    id = p.id,
        //    documentId = p.documentId,
        //    firstName = p.firstName,
        //    lastName = p.lastName,
        //    jobTitle = p.jobTitle,
        //    email = p.email,
        //    phone = p.phone,
        //    address = p.address
        //};

        //private SkillsDto MapSkillToDto(Skills s) => new SkillsDto
        //{
        //    id = s.id,
        //    name = s.name,
        //    documentId = s.documentId,
        //    main = s.main
        //};

        //private ExperienceDto MapExperienceToDto(Experience e) => new ExperienceDto
        //{
        //    id = e.id,
        //    documentId = e.documentId,
        //    title = e.title,
        //    position = e.position,
        //    startDate = e.startDate,
        //    endDate = e.endDate,
        //};

        //private EducationDto MapEducationToDto(Education e) => new EducationDto
        //{
        //    id = e.id,
        //    documentId = e.documentId,
        //    universityName = e.universityName,
        //    degree = e.degree,
        //    major = e.major,
        //    startDate = e.startDate,
        //    endDate = e.endDate
        //};
    }
}
