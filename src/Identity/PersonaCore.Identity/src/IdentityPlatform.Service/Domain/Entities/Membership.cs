namespace IdentityPlatform.Service.Domain.Entities;

public class Membership
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid OrganizationId { get; set; }
    public Organization Organization { get; set; } = null!;

    public Guid? OrganizationUnitId { get; set; }
    public OrganizationUnit? OrganizationUnit { get; set; }

    public Guid RoleId { get; set; }
    public Role Role { get; set; } = null!;

    public Guid? ScopeAreaId { get; set; }
    public Area? ScopeArea { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
