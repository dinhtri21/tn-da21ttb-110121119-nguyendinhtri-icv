using iCV.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Common.Interfaces
{
    public interface IPersonalInfoRepository
    {
        Task CreatePersonalInfoAsync(PersonalInfo personalInfo);
        Task<PersonalInfo?> GetPersonalInfoByIdAsync(string id);
        Task<IEnumerable<PersonalInfo>> GetAllPersonalInfosAsync();
        Task UpdatePersonalInfoAsync(PersonalInfo personalInfo);
        Task DeletePersonalInfoAsync(string id);
    }
}
