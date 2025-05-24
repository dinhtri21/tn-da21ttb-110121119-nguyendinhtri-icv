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
    public class SkillsRepository : ISkillsRepository
    {
        private readonly IMongoCollection<Skills> _skills;

        public SkillsRepository(MongoDbContext context)
        {
            _skills = context.Skills;
        }

        public async Task CreateSkillsAsync(Skills skills)
        {
            await _skills.InsertOneAsync(skills);
        }

        public async Task<Skills?> GetSkillsByIdAsync(string id)
        {
            return await _skills.Find(s => s.id == id).FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<Skills>> GetAllSkillsAsync()
        {
            return await _skills.Find(_ => true).ToListAsync();
        }

        public async Task UpdateSkillsAsync(Skills skills)
        {
            await _skills.ReplaceOneAsync(s => s.id == skills.id, skills);
        }

        public async Task DeleteSkillsAsync(string id)
        {
            await _skills.DeleteOneAsync(s => s.id == id);
        }
    }
}
