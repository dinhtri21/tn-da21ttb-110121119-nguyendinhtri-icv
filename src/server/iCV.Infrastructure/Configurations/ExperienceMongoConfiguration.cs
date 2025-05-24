using iCV.Domain.Entities;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Bson.Serialization.IdGenerators;

namespace iCV.Infrastructure.MongoMappings
{
    public static class ExperienceMongoConfiguration
    {
        private static bool _isMapped = false;

        public static void Configure()
        {
            if (_isMapped) return;

            BsonClassMap.RegisterClassMap<Experience>(cm =>
            {
                cm.AutoMap();

                // Cấu hình ID là ObjectId
                cm.MapIdProperty(e => e.id)
                  .SetIdGenerator(StringObjectIdGenerator.Instance)
                  .SetSerializer(new StringSerializer(BsonType.ObjectId))
                  .SetElementName("_id");

                cm.MapMember(e => e.documentId).SetElementName("documentId");
                cm.MapMember(e => e.title).SetElementName("title");
                cm.MapMember(e => e.position).SetElementName("position");
                cm.MapMember(e => e.currentlyWorking).SetElementName("currentlyWorking");
                cm.MapMember(e => e.startDate).SetElementName("startDate");
                cm.MapMember(e => e.endDate).SetElementName("endDate");
            });

            _isMapped = true;
        }
    }
}
