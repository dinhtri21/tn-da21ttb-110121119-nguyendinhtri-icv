using iCV.Application.Common.Interfaces;
using iCV.Domain.Entities;
using iCV.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;
using MongoDB.Driver.Search;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Infrastructure.Repositories
{
    public class AvatarRepository : IAvatarRepository
    {
        private readonly IMongoCollection<CV> _cv;
        public AvatarRepository(MongoDbContext context)
        {
            _cv = context.CV;

        }
        public async Task<Avatar?> CreateAvatarAsync(Avatar avatar, string cvId)
        {
            var cv = await _cv.Find(d => d.Id == cvId).FirstOrDefaultAsync();
            //if (cv == null)
            //{
            //    return null; 
            //}

            cv.Avatar = avatar;
            await _cv.ReplaceOneAsync(d => d.Id == cvId, cv);
            return cv.Avatar;
        }
    }
}
