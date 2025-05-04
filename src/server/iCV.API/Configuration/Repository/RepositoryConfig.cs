using iCV.Application.Common.Interfaces;
using iCV.Infrastructure.Repositories;

namespace iCV.API.Configuration.Repository
{
    public static class RepositoryConfig
    {
        public static IServiceCollection AddRepositories(this IServiceCollection services)
        {
            services.AddScoped<IUserRepository, UserRepository>();
            return services;
        }
    }
}
