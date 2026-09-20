using Microsoft.EntityFrameworkCore;
using Payment.Api.Domain;

namespace Payment.Api.Infrastructure.Data;

public class PaymentDbContext : DbContext
{
    public PaymentDbContext(DbContextOptions<PaymentDbContext> options) : base(options) { }

    public DbSet<Domain.Payment> Payments => Set<Domain.Payment>();
    public DbSet<PaymentEvent> PaymentEvents => Set<PaymentEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Domain.Payment>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Amount).HasPrecision(18, 2);
            e.Property(x => x.Currency).HasMaxLength(8);
            e.Property(x => x.SourceSystem).HasMaxLength(64);
            e.Property(x => x.ProviderCode).HasMaxLength(32);
            e.Property(x => x.ProviderOrderId).HasMaxLength(256);
            e.Property(x => x.ProviderPaymentId).HasMaxLength(256);
            e.Property(x => x.IdempotencyKey).HasMaxLength(128);
            e.Property(x => x.Description).HasMaxLength(512);
            e.Property(x => x.SuccessCallbackUrl).HasMaxLength(2048);
            e.HasIndex(x => x.IdempotencyKey).IsUnique();
            e.HasIndex(x => x.OrganizationId);
            e.HasIndex(x => x.PayableReferenceId);
            e.HasIndex(x => new { x.SourceSystem, x.PayableReferenceId });
            e.HasIndex(x => x.ProviderOrderId);
            e.HasIndex(x => x.Status);
        });

        modelBuilder.Entity<PaymentEvent>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.EventType).HasMaxLength(64);
            e.HasOne(x => x.Payment).WithMany(x => x.Events).HasForeignKey(x => x.PaymentId);
        });
    }
}
