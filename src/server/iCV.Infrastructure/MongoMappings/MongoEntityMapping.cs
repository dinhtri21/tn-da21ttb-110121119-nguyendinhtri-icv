using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Infrastructure.MongoMappings
{
    public static class MongoEntityMapping
    {
        private static bool _mapped = false;

        public static void Configure()
        {
            if (_mapped) return;

            UserMongoConfiguration.Configure();
            SkillsMongoConfiguration.Configure();
            ExperienceMongoConfiguration.Configure();
            PersonalInfoMongoConfiguration.Configure();
            EducationMongoConfiguration.Configure();
            DocumentMongoConfiguration.Configure();

            _mapped = true;
        }
    }
}
