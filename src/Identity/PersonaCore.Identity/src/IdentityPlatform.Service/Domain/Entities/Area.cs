namespace IdentityPlatform.Service.Domain.Entities;

public class Area
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public Organization Organization { get; set; } = null!;

    public Guid? ParentAreaId { get; set; }
    public Area? ParentArea { get; set; }
    public ICollection<Area> ChildAreas { get; set; } = new List<Area>();

    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
