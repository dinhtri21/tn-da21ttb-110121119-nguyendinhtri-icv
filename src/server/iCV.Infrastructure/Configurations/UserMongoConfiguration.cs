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
                cm.MapIdProperty(u => u.id)
                  .SetIdGenerator(StringObjectIdGenerator.Instance)
                  .SetSerializer(new StringSerializer(BsonType.ObjectId))
                  .SetElementName("_id"); // Mongo mặc định dùng _id

                cm.MapMember(u => u.name).SetElementName("name");
                cm.MapMember(u => u.email).SetElementName("email");
                cm.MapMember(u => u.password).SetElementName("password");
                cm.MapMember(u => u.provider).SetElementName("provider");
                cm.MapMember(u => u.createdAt).SetElementName("createdAt");
                cm.MapMember(u => u.updatedAt).SetElementName("updatedAt");
            });

            _isMapped = true;
        }
    }
}
