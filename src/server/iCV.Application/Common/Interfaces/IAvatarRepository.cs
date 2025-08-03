using iCV.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Common.Interfaces
{
    public interface IAvatarRepository
    {
        Task<Avatar?> CreateAvatarAsync (Avatar avatar, string cvId);
    }
}
