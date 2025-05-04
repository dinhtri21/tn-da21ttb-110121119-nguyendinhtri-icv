using iCV.Application.Common.Interfaces;
using iCV.Domain.Entities;
using iCV.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly iCVDbContext _context;
        public UserRepository(iCVDbContext context)
        {
            _context = context;
        }

        public async Task CreateUserAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users
                .Where(u => u.email == email)
                .FirstOrDefaultAsync();
        }
    }
}
