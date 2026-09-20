namespace IdentityPlatform.Service.Domain.Entities;

public class Organization
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<OrganizationUnit> Units { get; set; } = new List<OrganizationUnit>();
    public ICollection<Area> Areas { get; set; } = new List<Area>();
    public ICollection<Membership> Memberships { get; set; } = new List<Membership>();
}
