using iCV.Domain.Entities;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Bson.Serialization.IdGenerators;

namespace iCV.Infrastructure.MongoMappings
{
    public static class EducationMongoConfiguration
    {
        private static bool _isMapped = false;

        public static void Configure()
        {
            if (_isMapped) return;

            BsonClassMap.RegisterClassMap<Education>(cm =>
            {
                cm.AutoMap();

                // Map Id với ObjectId
                cm.MapIdProperty(e => e.id)
                  .SetIdGenerator(StringObjectIdGenerator.Instance)
                  .SetSerializer(new StringSerializer(BsonType.ObjectId))
                  .SetElementName("_id");

                cm.MapMember(e => e.documentId).SetElementName("documentId");
                cm.MapMember(e => e.universityName).SetElementName("universityName");
                cm.MapMember(e => e.degree).SetElementName("degree");
                cm.MapMember(e => e.major).SetElementName("major");
                cm.MapMember(e => e.startDate).SetElementName("startDate");
                cm.MapMember(e => e.endDate).SetElementName("endDate");
            });

            _isMapped = true;
        }
    }
}
