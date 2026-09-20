namespace Parking.Api.Domain.Pricing;

public class ParkingProduct
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public ProductType ProductType { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public ICollection<ParkingRate> Rates { get; set; } = new List<ParkingRate>();
}

public class ParkingRate
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public Guid? FacilityId { get; set; }
    public Guid ProductId { get; set; }
    public VehicleType VehicleType { get; set; }
    public string Currency { get; set; } = "INR";
    public decimal BaseAmount { get; set; }
    public decimal? PerHourAmount { get; set; }
    public decimal? MaxDailyAmount { get; set; }
    public DateTimeOffset EffectiveFrom { get; set; }
    public DateTimeOffset? EffectiveTo { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public string CreatedByKeycloakUserId { get; set; } = string.Empty;

    public ParkingProduct? Product { get; set; }
}
