using iCV.Domain.Entities;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Bson.Serialization.IdGenerators;

namespace iCV.Infrastructure.MongoMappings
{
    public static class UserMongoConfiguration
    {
        private static bool _isMapped = false;

        public static void Configure()
        {
            if (_isMapped) return;

            BsonClassMap.RegisterClassMap<User>(cm =>
            {
                cm.AutoMap();

                // Map id với ObjectId
                cm.MapIdProperty(u => u.Id)
                  .SetIdGenerator(StringObjectIdGenerator.Instance)
                  .SetSerializer(new StringSerializer(BsonType.ObjectId))
                  .SetElementName("_id"); // Mongo mặc định dùng _id

                cm.MapMember(u => u.Name).SetElementName("Name");
                cm.MapMember(u => u.Email).SetElementName("Email");
                cm.MapMember(u => u.Password).SetElementName("Password");
                cm.MapMember(u => u.Provider).SetElementName("Provider");
                cm.MapMember(u => u.CreatedAt).SetElementName("CreatedAt");
                cm.MapMember(u => u.UpdatedAt).SetElementName("UpdatedAt");
            });

            _isMapped = true;
        }
    }
}
