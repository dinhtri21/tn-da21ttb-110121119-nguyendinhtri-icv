using iCV.Domain.Entities;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Bson.Serialization.IdGenerators;

namespace iCV.Infrastructure.MongoMappings
{
    public static class PersonalInfoMongoConfiguration
    {
        private static bool _isMapped = false;

        public static void Configure()
        {
            if (_isMapped) return;

            BsonClassMap.RegisterClassMap<PersonalInfo>(cm =>
            {
                cm.AutoMap();

                // ID kiểu ObjectId trong MongoDB
                cm.MapIdProperty(p => p.id)
                  .SetIdGenerator(StringObjectIdGenerator.Instance)
                  .SetSerializer(new StringSerializer(BsonType.ObjectId))
                  .SetElementName("_id");

                cm.MapMember(e => e.documentId)
                  .SetElementName("documentId")
                  .SetSerializer(new StringSerializer(BsonType.ObjectId));

                cm.MapMember(p => p.firstName).SetElementName("firstName");
                cm.MapMember(p => p.lastName).SetElementName("lastName");
                cm.MapMember(p => p.jobTitle).SetElementName("jobTitle");
                cm.MapMember(p => p.address).SetElementName("address");
                cm.MapMember(p => p.phone).SetElementName("phone");
                cm.MapMember(p => p.email).SetElementName("email");
            });

            _isMapped = true;
        }
    }
}
