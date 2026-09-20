using Enforcement.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Enforcement.Api.Infrastructure.Data;

public class EnforcementDbContext : DbContext
{
    public EnforcementDbContext(DbContextOptions<EnforcementDbContext> options) : base(options)
    {
    }

    public DbSet<EnforcementDomain> EnforcementDomains => Set<EnforcementDomain>();
    public DbSet<SubjectTypeDefinition> SubjectTypes => Set<SubjectTypeDefinition>();
    public DbSet<ViolationType> ViolationTypes => Set<ViolationType>();
    public DbSet<ActionTypeDefinition> ActionTypes => Set<ActionTypeDefinition>();
    public DbSet<PenaltyRule> PenaltyRules => Set<PenaltyRule>();
    public DbSet<EnforcementCase> EnforcementCases => Set<EnforcementCase>();
    public DbSet<CaseSubject> CaseSubjects => Set<CaseSubject>();
    public DbSet<CaseViolation> CaseViolations => Set<CaseViolation>();
    public DbSet<EvidenceItem> EvidenceItems => Set<EvidenceItem>();
    public DbSet<EnforcementAction> EnforcementActions => Set<EnforcementAction>();
    public DbSet<FinancialObligation> FinancialObligations => Set<FinancialObligation>();
    public DbSet<CaseAuditEvent> CaseAuditEvents => Set<CaseAuditEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<EnforcementDomain>(e =>
        {
            e.ToTable("enforcement_domains");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.OrganizationId, x.Code }).IsUnique();
            e.Property(x => x.Code).HasMaxLength(64).IsRequired();
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<SubjectTypeDefinition>(e =>
        {
            e.ToTable("subject_types");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.EnforcementDomainId, x.Code }).IsUnique();
            e.Property(x => x.Code).HasMaxLength(64).IsRequired();
            e.HasOne(x => x.EnforcementDomain).WithMany(x => x.SubjectTypes).HasForeignKey(x => x.EnforcementDomainId);
        });

        modelBuilder.Entity<ViolationType>(e =>
        {
            e.ToTable("violation_types");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.EnforcementDomainId, x.Code }).IsUnique();
            e.Property(x => x.Code).HasMaxLength(64).IsRequired();
            e.HasOne(x => x.EnforcementDomain).WithMany(x => x.ViolationTypes).HasForeignKey(x => x.EnforcementDomainId);
        });

        modelBuilder.Entity<ActionTypeDefinition>(e =>
        {
            e.ToTable("action_types");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.EnforcementDomainId, x.Code }).IsUnique();
            e.Property(x => x.Code).HasMaxLength(64).IsRequired();
            e.HasOne(x => x.EnforcementDomain).WithMany(x => x.ActionTypes).HasForeignKey(x => x.EnforcementDomainId);
        });

        modelBuilder.Entity<PenaltyRule>(e =>
        {
            e.ToTable("penalty_rules");
            e.HasKey(x => x.Id);
            e.Property(x => x.Amount).HasPrecision(18, 2);
            e.Property(x => x.Currency).HasMaxLength(8);
            e.HasOne(x => x.ViolationType).WithMany(x => x.PenaltyRules).HasForeignKey(x => x.ViolationTypeId);
        });

        modelBuilder.Entity<EnforcementCase>(e =>
        {
            e.ToTable("enforcement_cases");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.CaseNumber).IsUnique();
            e.Property(x => x.CaseNumber).HasMaxLength(40).IsRequired();
            e.Property(x => x.CreatedByKeycloakUserId).HasMaxLength(128).IsRequired();
            e.Property(x => x.AssignedOfficerKeycloakUserId).HasMaxLength(128);
            e.HasOne(x => x.EnforcementDomain).WithMany().HasForeignKey(x => x.EnforcementDomainId);
            e.HasOne(x => x.Subject).WithOne(x => x.EnforcementCase!).HasForeignKey<CaseSubject>(x => x.EnforcementCaseId);
        });

        modelBuilder.Entity<CaseSubject>(e =>
        {
            e.ToTable("case_subjects");
            e.HasKey(x => x.Id);
            e.Property(x => x.SubjectTypeCode).HasMaxLength(64).IsRequired();
            e.Property(x => x.DisplayLabel).HasMaxLength(256).IsRequired();
            e.Property(x => x.ExternalId).HasMaxLength(128);
        });

        modelBuilder.Entity<CaseViolation>(e =>
        {
            e.ToTable("case_violations");
            e.HasKey(x => x.Id);
            e.HasOne(x => x.EnforcementCase).WithMany(x => x.Violations).HasForeignKey(x => x.EnforcementCaseId);
            e.HasOne(x => x.ViolationType).WithMany().HasForeignKey(x => x.ViolationTypeId);
        });

        modelBuilder.Entity<EvidenceItem>(e =>
        {
            e.ToTable("evidence_items");
            e.HasKey(x => x.Id);
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
            e.HasOne(x => x.EnforcementCase).WithMany(x => x.Evidence).HasForeignKey(x => x.EnforcementCaseId);
        });

        modelBuilder.Entity<EnforcementAction>(e =>
        {
            e.ToTable("enforcement_actions");
            e.HasKey(x => x.Id);
            e.HasOne(x => x.EnforcementCase).WithMany(x => x.Actions).HasForeignKey(x => x.EnforcementCaseId);
            e.HasOne(x => x.ActionType).WithMany().HasForeignKey(x => x.ActionTypeId);
            // Store obligation id as a plain FK value — avoid bidirectional graph issues with InMemory/providers.
            e.Ignore(x => x.FinancialObligation);
        });

        modelBuilder.Entity<FinancialObligation>(e =>
        {
            e.ToTable("financial_obligations");
            e.HasKey(x => x.Id);
            e.Property(x => x.Amount).HasPrecision(18, 2);
            e.Property(x => x.AmountPaid).HasPrecision(18, 2);
            e.Property(x => x.Currency).HasMaxLength(8);
            e.HasOne(x => x.EnforcementCase).WithMany(x => x.FinancialObligations).HasForeignKey(x => x.EnforcementCaseId);
        });

        modelBuilder.Entity<CaseAuditEvent>(e =>
        {
            e.ToTable("case_audit_events");
            e.HasKey(x => x.Id);
            e.Property(x => x.EventType).HasMaxLength(80).IsRequired();
            e.Property(x => x.ActorKeycloakUserId).HasMaxLength(128).IsRequired();
            e.HasOne(x => x.EnforcementCase).WithMany(x => x.AuditEvents).HasForeignKey(x => x.EnforcementCaseId);
        });
    }
}
