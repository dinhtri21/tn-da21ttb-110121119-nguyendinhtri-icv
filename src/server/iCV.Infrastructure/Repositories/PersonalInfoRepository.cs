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
    public class PersonalInfoRepository : IPersonalInfoRepository
    {
        private readonly IMongoCollection<PersonalInfo> _personalInfos;

        public PersonalInfoRepository(MongoDbContext context)
        {
            _personalInfos = context.PersonalInfos;
        }

        public async Task CreatePersonalInfoAsync(PersonalInfo personalInfo)
        {
            await _personalInfos.InsertOneAsync(personalInfo);
        }

        public async Task<PersonalInfo?> GetPersonalInfoByIdAsync(string id)
        {
            return await _personalInfos.Find(p => p.id == id).FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<PersonalInfo>> GetAllPersonalInfosAsync()
        {
            return await _personalInfos.Find(_ => true).ToListAsync();
        }

        public async Task UpdatePersonalInfoAsync(PersonalInfo personalInfo)
        {
            await _personalInfos.ReplaceOneAsync(p => p.id == personalInfo.id, personalInfo);
        }

        public async Task DeletePersonalInfoAsync(string id)
        {
            await _personalInfos.DeleteOneAsync(p => p.id == id);
        }
    }
}
