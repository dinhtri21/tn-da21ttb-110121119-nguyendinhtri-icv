using iCV.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Common.Interfaces
{
    public interface ISkillsRepository
    {
        Task CreateSkillsAsync(Skills skills);
        Task<Skills?> GetSkillsByIdAsync(string id);
        Task<IEnumerable<Skills>> GetAllSkillsAsync();
        Task UpdateSkillsAsync(Skills skills);
        Task DeleteSkillsAsync(string id);
    }
}
