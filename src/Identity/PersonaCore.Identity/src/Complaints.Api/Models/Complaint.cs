namespace Complaints.Api.Models;

public class Complaint
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Open";
    public Guid OrganizationId { get; set; }
    public Guid AreaId { get; set; }
    public string AreaName { get; set; } = string.Empty;
}
