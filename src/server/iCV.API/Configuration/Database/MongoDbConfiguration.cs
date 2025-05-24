using iCV.Infrastructure.MongoMappings;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using iCV.Infrastructure.Configurations;
using iCV.Infrastructure.Context;

namespace iCV.API.Configuration.Database
{
    public static class MongoDbConfiguration
    {
        public static IServiceCollection AddMongoDb(this IServiceCollection services, IConfiguration configuration)
        {
            // Bind settings
            services.Configure<MongoDbSettings>(
                configuration.GetSection("MongoDbSettings"));

            // Add Mongo client
            services.AddSingleton<IMongoClient>(sp =>
            {
                var settings = sp.GetRequiredService<IOptions<MongoDbSettings>>().Value;
                return new MongoClient(settings.ConnectionString);
            });

            // Add Mongo database
            services.AddScoped(sp =>
            {
                var settings = sp.GetRequiredService<IOptions<MongoDbSettings>>().Value;
                var client = sp.GetRequiredService<IMongoClient>();
                return client.GetDatabase(settings.DatabaseName);
            });

            // Register MongoDbContext to DI container
            services.AddSingleton<MongoDbContext>();

            // Register class maps
            MongoEntityMapping.Configure();

            return services;
        }
    }
}
