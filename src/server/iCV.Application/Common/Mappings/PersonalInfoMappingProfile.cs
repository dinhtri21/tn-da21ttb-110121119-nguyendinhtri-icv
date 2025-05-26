using AutoMapper;
using iCV.Application.Common.DTOs;
using iCV.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Common.Mappings
{
    public class PersonalInfoMappingProfile : Profile
    {
        public PersonalInfoMappingProfile() {
            CreateMap<PersonalInfo, PersonalInfoDto>();
        }
    }
}
