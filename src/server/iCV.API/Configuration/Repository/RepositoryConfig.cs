using iCV.Application.Common.Interfaces;
using iCV.Infrastructure.Repositories;
using iCV.Infrastructure.Services.GeminiService;
using iCV.Infrastructure.Services.TavilyService;

namespace iCV.API.Configuration.Repository
{
    public static class RepositoryConfig
    {
        public static IServiceCollection AddRepositories(this IServiceCollection services)
        {
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<ICVRepository, CVRepository>();
            services.AddScoped<IAvatarRepository, AvatarRepository>();
            services.AddHttpClient<IGeminiEvaluationService, GeminiEvaluationService>();
            services.AddHttpClient<IJobSuggestionService, TavilyJobSuggestionService>();

            return services;
        }
    }
}
