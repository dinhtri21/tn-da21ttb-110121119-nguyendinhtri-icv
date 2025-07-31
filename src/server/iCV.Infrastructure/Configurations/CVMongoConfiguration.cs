using iCV.Domain.Entities;
using MongoDB.Bson.Serialization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Infrastructure.Configurations
{
    public static class CVMongoConfiguration
    {
        private static bool _isMapped = false;

        public static void Configure()
        {
            if (_isMapped) return;

            BsonClassMap.RegisterClassMap<CV>(cm =>
            {
                cm.AutoMap();

                // Map id
                cm.MapIdProperty(e => e.Id)
                    .SetIdGenerator(MongoDB.Bson.Serialization.IdGenerators.StringObjectIdGenerator.Instance)
                    .SetSerializer(new MongoDB.Bson.Serialization.Serializers.StringSerializer(MongoDB.Bson.BsonType.ObjectId))
                    .SetElementName("_id");

                //// Map Id với ObjectId
                //cm.MapIdProperty(e => e.id)
                //  .SetIdGenerator(StringObjectIdGenerator.Instance)
                //  .SetSerializer(new StringSerializer(BsonType.ObjectId))
                //  .SetElementName("_id");

                //cm.MapMember(e => e.documentId)
                //  .SetElementName("documentId")
                //  .SetSerializer(new StringSerializer(BsonType.ObjectId));

                //cm.MapMember(e => e.universityName).SetElementName("universityName");
                //cm.MapMember(e => e.degree).SetElementName("degree");
                //cm.MapMember(e => e.major).SetElementName("major");
                //cm.MapMember(e => e.startDate).SetElementName("startDate");
                //cm.MapMember(e => e.endDate).SetElementName("endDate");
            });

            _isMapped = true;
        }
    }
}
