using Microsoft.EntityFrameworkCore;
using Parking.Api.Domain.Audit;
using Parking.Api.Domain.Facilities;
using Parking.Api.Domain.Obligations;
using Parking.Api.Domain.Occupancy;
using Parking.Api.Domain.Pricing;
using Parking.Api.Domain.Sessions;
using Parking.Api.Domain.Spaces;
using Parking.Api.Domain.Subscriptions;
using Parking.Api.Domain.Tickets;
using Parking.Api.Domain.Zones;

namespace Parking.Api.Infrastructure.Data;

public class ParkingDbContext : DbContext
{
    public ParkingDbContext(DbContextOptions<ParkingDbContext> options) : base(options)
    {
    }

    public DbSet<ParkingFacility> ParkingFacilities => Set<ParkingFacility>();
    public DbSet<ParkingZone> ParkingZones => Set<ParkingZone>();
    public DbSet<ParkingSpace> ParkingSpaces => Set<ParkingSpace>();
    public DbSet<OccupancySnapshot> OccupancySnapshots => Set<OccupancySnapshot>();
    public DbSet<ParkingProduct> ParkingProducts => Set<ParkingProduct>();
    public DbSet<ParkingRate> ParkingRates => Set<ParkingRate>();
    public DbSet<ParkingSession> ParkingSessions => Set<ParkingSession>();
    public DbSet<ParkingTicket> ParkingTickets => Set<ParkingTicket>();
    public DbSet<ParkingSubscription> ParkingSubscriptions => Set<ParkingSubscription>();
    public DbSet<FinancialObligation> FinancialObligations => Set<FinancialObligation>();
    public DbSet<ParkingAuditEvent> ParkingAuditEvents => Set<ParkingAuditEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ParkingFacility>(e =>
        {
            e.ToTable("parking_facilities");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.OrganizationId, x.Code }).IsUnique();
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.Property(x => x.Code).HasMaxLength(64).IsRequired();
            e.Property(x => x.CreatedByKeycloakUserId).HasMaxLength(128).IsRequired();
            e.Property(x => x.VehicleTypesCsv).HasMaxLength(256);
        });

        modelBuilder.Entity<ParkingZone>(e =>
        {
            e.ToTable("parking_zones");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.FacilityId, x.Code }).IsUnique();
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.Property(x => x.Code).HasMaxLength(64).IsRequired();
            e.HasOne(x => x.Facility).WithMany(x => x.Zones).HasForeignKey(x => x.FacilityId);
        });

        modelBuilder.Entity<ParkingSpace>(e =>
        {
            e.ToTable("parking_spaces");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.ZoneId, x.Code }).IsUnique();
            e.Property(x => x.Code).HasMaxLength(32).IsRequired();
            e.HasOne(x => x.Zone).WithMany(x => x.Spaces).HasForeignKey(x => x.ZoneId);
        });

        modelBuilder.Entity<OccupancySnapshot>(e =>
        {
            e.ToTable("occupancy_snapshots");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.FacilityId, x.RecordedAt });
        });

        modelBuilder.Entity<ParkingProduct>(e =>
        {
            e.ToTable("parking_products");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.OrganizationId, x.Code }).IsUnique();
            e.Property(x => x.Code).HasMaxLength(64).IsRequired();
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<ParkingRate>(e =>
        {
            e.ToTable("parking_rates");
            e.HasKey(x => x.Id);
            e.Property(x => x.BaseAmount).HasPrecision(18, 2);
            e.Property(x => x.PerHourAmount).HasPrecision(18, 2);
            e.Property(x => x.MaxDailyAmount).HasPrecision(18, 2);
            e.Property(x => x.Currency).HasMaxLength(8);
            e.HasOne(x => x.Product).WithMany(x => x.Rates).HasForeignKey(x => x.ProductId);
            e.HasIndex(x => new { x.OrganizationId, x.FacilityId, x.ProductId, x.VehicleType, x.IsActive });
        });

        modelBuilder.Entity<ParkingSession>(e =>
        {
            e.ToTable("parking_sessions");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.FacilityId, x.Status });
            e.Property(x => x.VehiclePlate).HasMaxLength(32).IsRequired();
            e.Property(x => x.CreatedByKeycloakUserId).HasMaxLength(128).IsRequired();
            e.Property(x => x.CalculatedAmount).HasPrecision(18, 2);
            e.Property(x => x.Currency).HasMaxLength(8);
        });

        modelBuilder.Entity<ParkingTicket>(e =>
        {
            e.ToTable("parking_tickets");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.TicketNumber).IsUnique();
            e.Property(x => x.TicketNumber).HasMaxLength(40).IsRequired();
            e.Property(x => x.VehiclePlate).HasMaxLength(32).IsRequired();
            e.Property(x => x.Amount).HasPrecision(18, 2);
            e.Property(x => x.Currency).HasMaxLength(8);
        });

        modelBuilder.Entity<ParkingSubscription>(e =>
        {
            e.ToTable("parking_subscriptions");
            e.HasKey(x => x.Id);
            e.Property(x => x.CustomerLabel).HasMaxLength(200).IsRequired();
            e.Property(x => x.CreatedByKeycloakUserId).HasMaxLength(128).IsRequired();
        });

        modelBuilder.Entity<FinancialObligation>(e =>
        {
            e.ToTable("financial_obligations");
            e.HasKey(x => x.Id);
            e.Property(x => x.Amount).HasPrecision(18, 2);
            e.Property(x => x.AmountPaid).HasPrecision(18, 2);
            e.Property(x => x.Currency).HasMaxLength(8);
        });

        modelBuilder.Entity<ParkingAuditEvent>(e =>
        {
            e.ToTable("parking_audit_events");
            e.HasKey(x => x.Id);
            e.Property(x => x.EventType).HasMaxLength(80).IsRequired();
            e.Property(x => x.ActorKeycloakUserId).HasMaxLength(128).IsRequired();
            e.HasIndex(x => new { x.OrganizationId, x.OccurredAt });
        });
    }
}
