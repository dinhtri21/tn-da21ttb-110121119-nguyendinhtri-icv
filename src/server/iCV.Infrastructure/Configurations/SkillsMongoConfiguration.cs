using iCV.Domain.Entities;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Bson.Serialization.IdGenerators;

namespace iCV.Infrastructure.MongoMappings
{
    public static class SkillsMongoConfiguration
    {
        private static bool _isMapped = false;

        public static void Configure()
        {
            if (_isMapped) return;

            BsonClassMap.RegisterClassMap<Skills>(cm =>
            {
                cm.AutoMap();

                // Map id với ObjectId
                cm.MapIdProperty(s => s.id)
                  .SetIdGenerator(StringObjectIdGenerator.Instance)
                  .SetSerializer(new StringSerializer(BsonType.ObjectId))
                  .SetElementName("_id");

                cm.MapMember(e => e.documentId)
                  .SetElementName("documentId")
                  .SetSerializer(new StringSerializer(BsonType.ObjectId));

                cm.MapMember(s => s.name).SetElementName("name");
                cm.MapMember(s => s.main).SetElementName("main");
            });

            _isMapped = true;
        }
    }
}
