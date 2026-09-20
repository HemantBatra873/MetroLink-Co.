namespace IdentityPlatform.Service.Domain.Entities;

public class Role
{
    public Guid Id { get; set; }
    public Guid? OrganizationId { get; set; }
    public Organization? Organization { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    public ICollection<Membership> Memberships { get; set; } = new List<Membership>();
}
