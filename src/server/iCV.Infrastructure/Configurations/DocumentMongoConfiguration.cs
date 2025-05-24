using iCV.Domain.Entities;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Bson.Serialization.IdGenerators;

namespace iCV.Infrastructure.MongoMappings
{
    public static class DocumentMongoConfiguration
    {
        private static bool _isMapped = false;

        public static void Configure()
        {
            if (_isMapped) return;

            BsonClassMap.RegisterClassMap<Document>(cm =>
            {
                cm.AutoMap();

                cm.MapIdProperty(d => d.id)
                  .SetIdGenerator(StringObjectIdGenerator.Instance)
                  .SetSerializer(new StringSerializer(BsonType.ObjectId))
                  .SetElementName("_id");

                cm.MapMember(d => d.userId).SetElementName("userId");
                cm.MapMember(d => d.title).SetElementName("title");
                cm.MapMember(d => d.summary).SetElementName("summary");
                cm.MapMember(d => d.themeColor).SetElementName("themeColor");
                cm.MapMember(d => d.thumbnail).SetElementName("thumbnail");
                cm.MapMember(d => d.currentPosition).SetElementName("currentPosition");
                cm.MapMember(d => d.authorName).SetElementName("authorName");
                cm.MapMember(d => d.authorEmail).SetElementName("authorEmail");
                cm.MapMember(d => d.createdAt).SetElementName("createdAt");
                cm.MapMember(d => d.updatedAt).SetElementName("updatedAt");
            });

            _isMapped = true;
        }
    }
}
