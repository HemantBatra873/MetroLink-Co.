namespace IdentityPlatform.Service.Domain.Entities;

public class OrganizationUnit
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public Organization Organization { get; set; } = null!;

    public Guid? ParentUnitId { get; set; }
    public OrganizationUnit? ParentUnit { get; set; }
    public ICollection<OrganizationUnit> SubUnits { get; set; } = new List<OrganizationUnit>();

    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
