
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using iCV.Domain.Entities;

namespace iCV.Infrastructure.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            // Create table
            builder.ToTable("User");

            // Primary key
            builder.HasKey(a => a.id);

            // Configure properties
            builder.Property(a => a.AdminId)
        }
    }
}
