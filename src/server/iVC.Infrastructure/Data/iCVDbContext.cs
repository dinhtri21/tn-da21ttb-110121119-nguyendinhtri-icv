using Microsoft.EntityFrameworkCore;

namespace iCV.Infrastructure.Data
{
    public class iCVDbContext : DbContext
    {
        public iCVDbContext()
        {

        }
        public iCVDbContext(DbContextOptions<iCVDbContext> options) : base(options)
        {

        }
        
        //public DbSet<Shipping> Shippings { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Configure using Fluent API
            //modelBuilder.ApplyConfiguration(new CustomerConfiguration());
           
        }

        internal async Task ToListAsync()
        {
            throw new NotImplementedException();
        }
    }
}