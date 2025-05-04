using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using iCV.Domain.Entities;

namespace iCV.Infrastructure.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            // Create table
            builder.ToTable("user");

            // Set primary key
            builder.HasKey(u => u.id);

            // Set properties
            builder.Property(u => u.id)
                .IsRequired()
                .ValueGeneratedOnAdd()
                .HasColumnName("id")
                .HasColumnType("int");

            builder.Property(u => u.name)
                .IsRequired()
                .HasColumnName("name")
                .HasColumnType("nvarchar(255)")
                .HasMaxLength(255);

            builder.Property(u => u.email)
                .IsRequired()
                .HasColumnName("email")
                .HasColumnType("varchar(255)")
                .HasMaxLength(255);

            builder.Property(u => u.password)
                .IsRequired()
                .HasColumnName("password")
                .HasColumnType("varchar(100)")
                .HasMaxLength(100);

            builder.Property(u => u.createdAt)
                .IsRequired()
                .HasColumnName("createdAt")
                .HasColumnType("datetime")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(u => u.updatedAt)
                .IsRequired()
                .HasColumnName("updatedAt")
                .HasColumnType("datetime")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        }
    }


}
