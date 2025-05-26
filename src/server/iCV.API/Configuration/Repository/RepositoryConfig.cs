using iCV.Application.Common.Interfaces;
using iCV.Infrastructure.Repositories;

namespace iCV.API.Configuration.Repository
{
    public static class RepositoryConfig
    {
        public static IServiceCollection AddRepositories(this IServiceCollection services)
        {
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IDocumentRepository, DocumentRepository>();
            services.AddScoped<IEducationRepository, EducationRepository>();
            services.AddScoped<IExperienceRepository, ExperienceRepository>();
            services.AddScoped<IPersonalInfoRepository, PersonalInfoRepository>();
            services.AddScoped<ISkillsRepository, SkillsRepository>();
            services.AddScoped<ICVRepository, CVRepository>();

            return services;
        }
    }
}
