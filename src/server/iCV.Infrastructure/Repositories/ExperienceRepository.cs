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
    public class ExperienceRepository : IExperienceRepository
    {
        private readonly IMongoCollection<Experience> _experiences;

        public ExperienceRepository(MongoDbContext context)
        {
            _experiences = context.Experiences;
        }

        public async Task CreateExperienceAsync(Experience experience)
        {
            await _experiences.InsertOneAsync(experience);
        }

        public async Task<Experience?> GetExperienceByIdAsync(string id)
        {
            return await _experiences.Find(e => e.id == id).FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<Experience>> GetAllExperiencesAsync()
        {
            return await _experiences.Find(_ => true).ToListAsync();
        }

        public async Task UpdateExperienceAsync(Experience experience)
        {
            await _experiences.ReplaceOneAsync(e => e.id == experience.id, experience);
        }

        public async Task DeleteExperienceAsync(string id)
        {
            await _experiences.DeleteOneAsync(e => e.id == id);
        }
    }
}
