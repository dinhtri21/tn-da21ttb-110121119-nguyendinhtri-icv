using iCV.Application.Common.Interfaces;
using iCV.Domain.Entities;
using iCV.Infrastructure.Configurations;
using iCV.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly IMongoCollection<User> _users;
        public UserRepository(MongoDbContext context)
        {
            _users = context.Users;
        }

        public async Task CreateUserAsync(User user)
        {
            await _users.InsertOneAsync(user);
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            var filter = Builders<User>.Filter.Eq(u => u.email, email);
            return await _users.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<User?> GetUserByIdAsync(string id)
        {
            return await _users.Find(u => u.id == id).FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _users.Find(_ => true).ToListAsync();
        }

        public async Task UpdateUserAsync(User user)
        {
            await _users.ReplaceOneAsync(u => u.id == user.id, user);
        }

        public async Task DeleteUserAsync(string id)
        {
            await _users.DeleteOneAsync(u => u.id == id);
        }
    }
}
