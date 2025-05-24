using iCV.Domain.Entities;
using iCV.Infrastructure.Configurations;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Infrastructure.Context
{
    public class MongoDbContext
    {
        private readonly IMongoDatabase _database;

        public MongoDbContext(IOptions<MongoDbSettings> options)
        {
            var client = new MongoClient(options.Value.ConnectionString);
            _database = client.GetDatabase(options.Value.DatabaseName);
        }

        public IMongoCollection<User> Users => _database.GetCollection<User>("users");
        public IMongoCollection<Skills> Skills => _database.GetCollection<Skills>("skills");
        public IMongoCollection<Experience> Experiences => _database.GetCollection<Experience>("experiences");
        public IMongoCollection<Education> Educations => _database.GetCollection<Education>("educations");
        public IMongoCollection<PersonalInfo> PersonalInfos => _database.GetCollection<PersonalInfo>("personalInfos");
        public IMongoCollection<Document> Documents => _database.GetCollection<Document>("documents");

        public IMongoCollection<T> GetCollection<T>(string collectionName)
        {
            return _database.GetCollection<T>(collectionName);
        }
    }
}
