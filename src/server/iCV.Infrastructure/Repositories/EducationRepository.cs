using iCV.Application.Common.Interfaces;
using iCV.Domain.Entities;
using iCV.Infrastructure.Context;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Infrastructure.Repositories
{
    public class EducationRepository : IEducationRepository
    {
        private readonly IMongoCollection<Education> _educations;

        public EducationRepository(MongoDbContext context)
        {
            _educations = context.Educations;
        }

        public async Task CreateEducationAsync(Education education)
        {
            await _educations.InsertOneAsync(education);
        }

        public async Task<Education?> GetEducationByIdAsync(string id)
        {
            return await _educations.Find(e => e.id == id).FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<Education>> GetAllEducationsAsync()
        {
            return await _educations.Find(_ => true).ToListAsync();
        }

        public async Task UpdateEducationAsync(Education education)
        {
            await _educations.ReplaceOneAsync(e => e.id == education.id, education);
        }

        public async Task DeleteEducationAsync(string id)
        {
            await _educations.DeleteOneAsync(e => e.id == id);
        }
    }
}
