using iCV.Application.Common.DTOs;
using iCV.Application.Common.Interfaces;
using iCV.Domain.Entities;
using iCV.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
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

        public async Task<IList<CV?>> GetCVsAsync(string userId)
        {
            return await _cv
                        .Find(d => d.UserId == userId)
                        .SortByDescending(d => d.CreateWhen)
                        .ToListAsync();
        }

        public async Task<CV?> UpdateCVAsync(CV cv)
        {
            var filter = Builders<CV>.Filter.Eq(c => c.Id, cv.Id);
            var updateResult = await _cv.ReplaceOneAsync(filter, cv);

            if (updateResult.IsAcknowledged && updateResult.ModifiedCount > 0)
            {
                return cv;
            }
            return null;
        }

        public async Task DeleteCVAsync(string id)
        {
            var filter = Builders<CV>.Filter.Eq(c => c.Id, id);
            await _cv.DeleteOneAsync(filter);
        }
    }
}
